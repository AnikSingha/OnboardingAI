import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import expressWs from 'express-ws';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import OpenAI from 'openai';
import fs from 'fs';
import twilio from 'twilio';
import { MongoClient } from 'mongodb'; // Import MongoDB client

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3000;
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB setup
const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to initiate calls to all leads
app.post('/call-leads', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('auth');
    const leadsCollection = database.collection('leads');

    // Retrieve all phone numbers from the 'leads' collection
    const leads = await leadsCollection.find({}).toArray();
    const phoneNumbers = leads.map(lead => lead._number);

    // Output the list of phone numbers to the console before calling them
    console.log('Leads to be called:', phoneNumbers);

    for (const number of phoneNumbers) {
      if (number) {
        await makeCall(number);
      }
    }

    res.status(200).send('Calls initiated successfully to all leads.');
  } catch (error) {
    console.error('Error calling leads:', error);
    res.status(500).send('Error calling leads');
  } finally {
    await client.close();
  }
});

// Function to make a call using Twilio
const makeCall = async (to) => {
  try {
    const call = await twilioClient.calls.create({
      url: `https://${process.env.HOST}/twilio-stream?phoneNumber=${to}`,
      to: to,
      from: TWILIO_PHONE_NUMBER,
      machineDetection: 'Enable',  // Optional, if needed
      sendDigits: '',  // Optional, if needed
    });
    console.log(`Call initiated, SID: ${call.sid}, to: ${to}`);
  } catch (error) {
    console.error(`Error initiating call to ${to}:`, error);
  }
};

// Twilio Stream Webhook
app.post('/twilio-stream', (req, res) => {
  const phoneNumber = req.query.phoneNumber; // Extract phone number from query parameters

  const response = `
    <Response>
      <Connect>
        <Stream url="wss://${req.headers.host}/media">
          <Parameter name="phoneNumber" value="${phoneNumber}" />
        </Stream>
      </Connect>
    </Response>
  `;
  res.type('text/xml');
  res.send(response);
});

// WebSocket endpoint to handle incoming audio from Twilio
app.ws('/media', (ws, req) => {
  let streamSid;
  let callSid;
  let dgLive;
  let audioBufferQueue = [];
  let phoneNumber;
  let interactionCount = 0;
  let callerName = ''; // Variable to store caller's name

  console.log('WebSocket connection established');

  // Function to send audio frames to Twilio
  const sendAudioFrames = async (audioBuffer, ws, streamSid, index) => {
    if (index === interactionCount && ws.readyState === ws.OPEN) {
      await sendBufferedAudio(audioBuffer, ws, streamSid);
      interactionCount++;
    }
  };

  const sendBufferedAudio = async (audioBuffer, ws, streamSid) => {
    const frameSize = 160;
    const frameDurationMs = 20;

    for (let i = 0; i < audioBuffer.length; i += frameSize) {
      if (ws.readyState !== ws.OPEN) {
        console.log('WebSocket is not open. Stopping audio frame transmission.');
        break;
      }

      const frame = audioBuffer.slice(i, i + frameSize);
      const frameBase64 = frame.toString('base64');

      ws.send(
        JSON.stringify({
          event: 'media',
          streamSid: streamSid,
          media: {
            payload: frameBase64,
          },
        }),
        (error) => {
          if (error) {
            console.error('Error sending TTS audio frame to Twilio:', error);
          }
        }
      );

      await new Promise((resolve) => setTimeout(resolve, frameDurationMs));
    }

    if (ws.readyState === ws.OPEN) {
      const markLabel = uuidv4();
      ws.send(
        JSON.stringify({
          event: 'mark',
          streamSid: streamSid,
          mark: {
            name: markLabel,
          },
        })
      );
    }
  };

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.event === 'start') {
      console.log('Start event data:', JSON.stringify(data, null, 2));
      streamSid = data.start.streamSid;
      callSid = data.start.callSid;
    
      // Retrieve the phone number from custom parameters
      if (data.start.customParameters && data.start.customParameters.phoneNumber) {
        phoneNumber = data.start.customParameters.phoneNumber;
      }
    
      console.log(`Stream started: ${streamSid} for phone number: ${phoneNumber}`);
    
      dgLive = deepgram.listen.live({
        encoding: 'mulaw',
        sample_rate: 8000,
        channels: 1,
        model: 'nova',
        punctuate: true,
        interim_results: true,
        endpointing: 200,
        utterance_end_ms: 1000,
      });
  
      dgLive.on(LiveTranscriptionEvents.Open, async () => {
        console.log('Deepgram Live Transcription connection opened.');
        
        const initialMessage = 'Hello! May I know your name, please?';
        console.log('Sending initial message to user:', initialMessage);
        
        const ttsAudioBuffer = await generateTTS(initialMessage);
        await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
      });
  
      dgLive.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
        if (transcription.is_final) { // Only process final transcriptions
          const alternatives = transcription.channel.alternatives[0];
          const transcript = alternatives.transcript;
  
          // Process only non-empty transcriptions
          if (transcript.trim()) {
            console.log('Final Transcription:', transcript);
  
            // Check if we have collected the caller's name
            if (!callerName) {
              const extractedName = await processTranscript(transcript, true);
              if (extractedName) {
                callerName = extractedName;
                console.log(`Caller name captured: ${callerName}`);
  
                // Generate JSON object and save to MongoDB
                const leadInfo = {
                  number: phoneNumber, // Use the phone number here
                  name: callerName,
                };
                await updateLeadInfo(phoneNumber, leadInfo); // Pass the phone number to updateLeadInfo
  
                // Continue the conversation
                const responseMessage = `Nice to meet you, ${callerName}. How can I assist you today?`;
                const ttsAudioBuffer = await generateTTS(responseMessage);
                await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
                return;
              }
            }
  
            // Continue with GPT-3 processing for other interactions
            const assistantResponse = await processTranscript(transcript);
            const ttsAudioBuffer = await generateTTS(assistantResponse);
            await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
  
            console.log('Assistant response sent to Twilio.');
          } else {
            console.log('Received empty final transcription, skipping.');
          }
        }
      });
  
      dgLive.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
      });
  
      dgLive.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram Live Transcription connection closed.');
      });
  
    } else if (data.event === 'media') {
      const audioBufferData = Buffer.from(data.media.payload, 'base64');
  
      if (dgLive && dgLive.getReadyState() === 1) {
        dgLive.send(audioBufferData);
      } else {
        audioBufferQueue.push(audioBufferData);
      }
    } else if (data.event === 'stop') {
      console.log('Stream stopped.');
      if (dgLive) {
        dgLive.finish();
      }
      ws.close();
    }
  });
  
  ws.on('stop', () => {
    console.log('Stream stopped.');
    if (dgLive) {
      dgLive.finish();
    }
    if (ws.readyState === ws.OPEN) {
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (dgLive) {
      dgLive.finish();
    }
    audioBufferQueue.length = 0;
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to update the lead information in MongoDB
const updateLeadInfo = async (phoneNumber, leadInfo) => {
  try {
    await client.connect();
    const database = client.db('auth');
    const leadsCollection = database.collection('leads');

    await leadsCollection.updateOne(
      { _number: phoneNumber }, // Update based on unique identifier (phone number)
      { $set: { name: leadInfo.name } },
      { upsert: true } // Create a new document if it doesn't exist
    );

    console.log(`Lead info updated for phone number: ${phoneNumber}`);
  } catch (error) {
    console.error('Error updating lead information:', error);
  } finally {
    await client.close();
  }
};

// Function to process transcript with GPT-3
const processTranscript = async (transcript, isAskingForName = false) => {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  try {
    let response;
    if (isAskingForName) {
      // Ask GPT to extract and return only the name from the transcript
      response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that extracts specific information. Your job is to extract and return only the name from the given statement.',
          },
          {
            role: 'user',
            content: `Extract the name from this statement: "${transcript}"`,
          },
        ],
      });
    } else {
      // Proceed with regular GPT processing
      response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly assistant that helps users with general inquiries.',
          },
          { role: 'user', content: transcript },
        ],
      });
    }

    const assistantResponse = response.choices[0].message.content.trim();

    console.log(isAskingForName ? `Extracted Name: ${assistantResponse}` : `Assistant Response: ${assistantResponse}`);
    return assistantResponse;
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
};

// Function to generate TTS audio buffer using Deepgram
const generateTTS = async (text) => {
  if (!text || text.trim() === '') {
    throw new Error('Text for TTS cannot be null or empty');
  }

  try {
    const ttsResponse = await axios.post(
      'https://api.deepgram.com/v1/speak',
      { text },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'audio/mulaw',
        },
        params: {
          encoding: 'mulaw',
          container: 'none',
          sample_rate: 8000,
        },
        responseType: 'arraybuffer',
      }
    );

    if (ttsResponse.status !== 200) {
      throw new Error('TTS generation failed');
    }

    return Buffer.from(ttsResponse.data);
  } catch (error) {
    console.error('Error in generateTTS:', error);
    throw error;
  }
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
