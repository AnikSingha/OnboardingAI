const twilio = require('twilio');
const { generateTTS, processTranscript } = require('./deepgramService.js');
const { v4: uuidv4 } = require('uuid');
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const { client, updateLeadInfo } = require('./database.js');
const dotenv = require('dotenv');
const WebSocket = require('ws');

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


const callLeads = async (req, res) => {
  try {
    await client.connect();
    const database = client.db('auth');
    const leadsCollection = database.collection('leads');

    const leads = await leadsCollection.find({}).toArray();
    const phoneNumbers = leads.map(lead => lead._number);

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
};

const makeCall = async (to) => {
  try {
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL}/twilio-stream?phoneNumber=${to}`,
      to: to,
      from: TWILIO_PHONE_NUMBER,
    });
    console.log(`Call initiated, SID: ${call.sid}, to: ${to}`);
  } catch (error) {
    console.error(`Error initiating call to ${to}:`, error);
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
};

const handleWebSocket = (ws, req) => {
  let streamSid;
  let callSid;
  let dgLive;
  let audioBufferQueue = [];
  let phoneNumber;
  let interactionCount = 0;
  let callerName = '';

  console.log('WebSocket connection established');

  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
      console.log('Ping sent to client');
    }
  }, 30000);

  ws.on('pong', () => {
    console.log('Received pong from client');
  });

  const sendAudioFrames = async (audioBuffer, ws, streamSid, index) => {
    if (index === interactionCount && ws.readyState === ws.OPEN) {
      await sendBufferedAudio(audioBuffer, ws, streamSid);
      
      const markLabel = uuidv4();
      ws.send(JSON.stringify({
        event: 'mark',
        streamSid: streamSid,
        mark: { name: markLabel }
      }));
      
      interactionCount++;
    }
  };

  ws.on('message', async (message) => {
    try {
      console.log('Raw WebSocket message received:', message.toString());
      const data = JSON.parse(message);
      console.log('Parsed WebSocket message:', {
        event: data.event,
        hasStart: !!data.start,
        hasMedia: !!data.media,
        streamSid: data.start?.streamSid
      });
      
      if (data.event === 'start') {
        console.log('Start event data:', JSON.stringify(data, null, 2));
        streamSid = data.start.streamSid;
        callSid = data.start.callSid;
        
        if (data.start.customParameters?.phoneNumber) {
          phoneNumber = data.start.customParameters.phoneNumber;
          console.log(`Phone number from parameters: ${phoneNumber}`);
        }

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

        dgLive.addListener(LiveTranscriptionEvents.Open, async () => {
          console.log('Deepgram Live Transcription connection opened.');
          try {
            const initialMessage = 'Hello! May I know your name, please?';
            console.log('Sending initial message to user:', initialMessage);
            const ttsAudioBuffer = await generateTTS(initialMessage);
            await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
          } catch (error) {
            console.error('Error in initial message flow:', error);
          }
        });

        dgLive.addListener(LiveTranscriptionEvents.Transcript, async (transcription) => {
          if (transcription.is_final) {
            const transcript = transcription.channel.alternatives[0].transcript;
            
            if (transcript.trim()) {
              console.log('Final Transcription:', transcript);

              if (!callerName) {
                const extractedName = await processTranscript(transcript, true);
                if (extractedName) {
                  callerName = extractedName;
                  console.log(`Caller name captured: ${callerName}`);
                  
                  await updateLeadInfo(phoneNumber, {
                    _number: phoneNumber,
                    name: callerName
                  });

                  const responseMessage = `Nice to meet you, ${callerName}. How can I assist you today?`;
                  const ttsAudioBuffer = await generateTTS(responseMessage);
                  await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
                  return;
                }
              }

              const response = await processTranscript(transcript, callerName);
              if (response) {
                console.log('Assistant response:', response);
                const ttsAudioBuffer = await generateTTS(response);
                await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
                console.log('Assistant response sent to Twilio.');
              }
            } else {
              console.log('Received empty final transcription, skipping.');
            }
          }
        });

        dgLive.addListener(LiveTranscriptionEvents.Error, (error) => {
          console.error('Deepgram error:', error);
        });

        dgLive.addListener(LiveTranscriptionEvents.Close, () => {
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
    } catch (error) {
      console.error('Error processing message:', error);
      console.error('Message that caused error:', message.toString());
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    clearInterval(pingInterval);
    console.log('WebSocket connection closed');
    if (dgLive) {
      dgLive.finish();
    }
    audioBufferQueue.length = 0;
  });
};

const twilioStreamWebhook = (req, res) => {
  const phoneNumber = req.query.phoneNumber || req.body.to;
  console.log('Twilio webhook received:', {
    phoneNumber,
    query: req.query,
    body: req.body,
    method: req.method
  });
  
  const response = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Connect>
        <Stream url="wss://api.onboardingai.org/call-leads/media">
          <Parameter name="phoneNumber" value="${phoneNumber}" />
        </Stream>
      </Connect>
      <Pause length="300"/>
    </Response>
  `;
  res.type('text/xml');
  res.send(response);
  console.log('Twilio webhook response sent');
};

module.exports = {
  handleWebSocket,
  twilioStreamWebhook,
  callLeads,
  updateLeadInfo
};
