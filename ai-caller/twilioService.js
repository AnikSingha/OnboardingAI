const twilio = require('twilio');
const { generateTTS, processTranscript, initializeDeepgram } = require('./deepgramService.js');
const { v4: uuidv4 } = require('uuid');
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const { getDb, updateLeadInfo } = require('../auth-service/db.js');
const dotenv = require('dotenv');
const WebSocket = require('ws');

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const PROCESSING_TIMEOUT = 5000;

const makeCall = async (to) => {
  try {
    const call = await twilioClient.calls.create({
      url: `https://api.onboardingai.org/call-leads/twilio-stream?phoneNumber=${encodeURIComponent(to)}`,
      to: to,
      from: TWILIO_PHONE_NUMBER,
    });
    console.log(`Call initiated, SID: ${call.sid}, to: ${to}`);
  } catch (error) {
    console.error(`Error initiating call to ${to}:`, error);
  }
};

const sendBufferedAudio = async (audioBuffer, ws, streamSid) => {
  const chunkSize = 640;
  try {
    for (let i = 0; i < audioBuffer.length; i += chunkSize) {
      if (ws.readyState !== ws.OPEN) {
        console.log('WebSocket not open, stopping audio transmission');
        break;
      }
      const chunk = audioBuffer.slice(i, i + chunkSize);
      ws.send(JSON.stringify({
        event: 'media',
        streamSid: streamSid,
        media: {
          payload: chunk.toString('base64')
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  } catch (error) {
    console.error('Error sending buffered audio:', error);
  }
};

const handleWebSocket = (ws, req) => {
  const MAX_QUEUE_SIZE = 50;
  let streamSid;
  let callSid;
  let audioBufferQueue = [];
  let phoneNumber;
  let interactionCount = 0;
  let callerName = '';
  let isProcessing = false;
  let finalTranscript = '';
  let deepgramReady = false;


  const processQueue = async () => {
    if (audioBufferQueue.length > 0 && deepgramReady && dgLive) {
      while (audioBufferQueue.length > 0) {
        const chunk = audioBufferQueue.shift();
        dgLive.send(chunk);
        await new Promise(resolve => setTimeout(resolve, 20)); // Adjust delay as needed
      }
    }
  };

  const sendAudioFrames = async (audioBuffer, ws, streamSid, interactionCount) => {
    try {
      if (!streamSid) {
        console.error('No streamSid available for sending audio');
        return;
      }

      const chunkSize = 640;
      const markLabel = `response_${interactionCount}`;

      ws.send(JSON.stringify({
        streamSid,
        event: 'mark',
        mark: {
          name: markLabel
        }
      }));

      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        const chunk = audioBuffer.slice(i, i + chunkSize);
        ws.send(JSON.stringify({
          streamSid,
          event: 'media',
          media: {
            payload: chunk.toString('base64')
          }
        }));
      }

      console.log(`Audio frames sent with mark: ${markLabel}`);
    } catch (error) {
      console.error('Error sending audio frames:', error);
      throw error;
    }
  };

  console.log('Initializing WebSocket handler');

  const dgLive = initializeDeepgram({
    onOpen: async () => {
      console.log('Deepgram connection opened');
      deepgramReady = true;
      processQueue();
      try {
        const initialMessage = 'Hello! May I know your name, please?';
        if (streamSid) {
          const ttsAudioBuffer = await generateTTS(initialMessage);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
          interactionCount++;
        }
      } catch (error) {
        console.error('Error in initial message flow:', error);
      }
    },
    onTranscript: async (transcription) => {
      try {
        if (!transcription.is_final) return;
        
        const transcript = transcription.channel.alternatives[0].transcript.trim();
        if (!transcript) return;

        console.log('Received transcript:', transcript, 
                   'is_final:', transcription.is_final, 
                   'speech_final:', transcription.speech_final);

        finalTranscript += ' ' + transcript;

        if (!transcription.speech_final && transcription.type !== 'UtteranceEnd') {
          return;
        }

        const completeTranscript = finalTranscript.trim();
        console.log('Processing complete transcript:', completeTranscript);
        finalTranscript = '';

        if (isProcessing) {
          console.log('Already processing, skipping transcript');
          return;
        }

        isProcessing = true;
        try {
          if (!callerName) {
            const extractedName = await processTranscript(completeTranscript, true);
            if (extractedName) {
              callerName = extractedName;
              console.log(`Caller name captured: ${callerName}`);
              
              if (phoneNumber) {
                await updateLeadInfo(phoneNumber, {
                  _number: phoneNumber,
                  name: callerName
                });
              }

              const responseMessage = `Nice to meet you, ${callerName}. How can I assist you today?`;
              const ttsAudioBuffer = await generateTTS(responseMessage);
              await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
              interactionCount++;
            }
          } else {
            const response = await processTranscript(completeTranscript, false);
            if (response) {
              const ttsAudioBuffer = await generateTTS(response);
              await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
              interactionCount++;
            }
          }
        } finally {
          isProcessing = false;
        }
      } catch (error) {
        console.error('Error processing transcript:', error);
        isProcessing = false;
      }
    },
    onError: (error) => {
      console.error('Deepgram error:', error);
      deepgramReady = false;
    },
    onClose: () => {
      console.log('Deepgram connection closed');
      deepgramReady = false;
    },
    processQueue
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      
      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        callSid = msg.start.callSid;
        phoneNumber = msg.start.customParameters?.phoneNumber;
      } else if (msg.event === 'media') {
        if (deepgramReady && dgLive) {
          dgLive.send(Buffer.from(msg.media.payload, 'base64'));
        } else if (audioBufferQueue.length < MAX_QUEUE_SIZE) {
          audioBufferQueue.push(Buffer.from(msg.media.payload, 'base64'));
          console.log('Queuing audio. Queue size:', audioBufferQueue.length);
        }
      } else if (msg.event === 'stop') {
        console.log('Stream stopped, cleaning up...');
        if (dgLive) {
          dgLive.finish();
        }
        ws.close();
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  const cleanup = () => {
  if (dgLive) {
    dgLive.finish();
  }
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  audioBufferQueue = [];
  deepgramReady = false;
};

  ws.on('pong', () => {
    console.log('Received pong from client');
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clearInterval(pingInterval);
    if (dgLive) {
      dgLive.finish();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(pingInterval);
    if (dgLive) {
      dgLive.finish();
    }
  });

  return { cleanup };
};

const twilioStreamWebhook = (req, res) => {
  console.log('Full webhook request:', {
    query: req.query,
    body: req.body,
    params: req.params,
    headers: req.headers
  });

  const phoneNumber = req.query.phoneNumber || req.body.To || req.body.to;
  console.log('Twilio webhook received:', {
    phoneNumber,
    query: req.query,
    body: req.body,
    method: req.method
  });
  
  if (!phoneNumber) {
    console.error('No phone number found in request');
    console.error('Query params:', req.query);
    console.error('Body:', req.body);
  }
  
  const response = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Connect>
      <Stream url="wss://api.onboardingai.org/call-leads/media">
        <Parameter name="phoneNumber" value="${phoneNumber}" />
        <Parameter name="callSid" value="${req.body.CallSid || ''}" />
        <Parameter name="debug" value="true" />
      </Stream>
    </Connect>
    <Pause length="60"/>
  </Response>`;
  
  res.type('text/xml');
  res.send(response);
  console.log('Twilio webhook response sent with phone number:', phoneNumber);
};

const callLeads = async (req, res) => {
  try {
    const db = await getDb();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const leadsCollection = db.collection('leads');
    const leads = await leadsCollection.find({}).toArray();
    
    console.log('Leads to be called:', leads.length);
    
    for (const lead of leads) {
      if (lead._number) {
        await makeCall(lead._number);
      }
    }

    res.status(200).json({ message: 'Calls initiated successfully', count: leads.length });
  } catch (error) {
    console.error('Error calling leads:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate calls' });
  }
};

module.exports = {
  handleWebSocket,
  twilioStreamWebhook,
  callLeads,
  makeCall
};