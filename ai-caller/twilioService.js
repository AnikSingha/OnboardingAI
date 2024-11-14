const twilio = require('twilio');
const { generateTTS, processTranscript, initializeDeepgram } = require('./deepgramService.js');
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const WebSocket = require('ws');

dotenv.config();

const handleWebSocket = (ws, req) => {
  let streamSid;
  let callSid;
  let dgLive;
  let audioBufferQueue = [];
  let phoneNumber;
  let interactionCount = 0;
  let callerName = '';

  // Debug incoming request
  console.log('WebSocket connection attempt:', {
    url: req.url,
    headers: req.headers,
    query: req.query,
    method: req.method
  });

  // Add heartbeat to prevent timeout
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
      console.log('Ping sent to client');
    }
  }, 30000);

  ws.on('pong', () => {
    console.log('Received pong from client');
  });

  // Function to send audio frames to Twilio
  const sendAudioFrames = async (audioBuffer, ws, streamSid, index) => {
    console.log(`Attempting to send audio frames. Buffer size: ${audioBuffer.length}, Index: ${index}`);
    if (index === interactionCount && ws.readyState === ws.OPEN) {
      await sendBufferedAudio(audioBuffer, ws, streamSid);
      interactionCount++;
      console.log(`Audio frames sent successfully. New interaction count: ${interactionCount}`);
    } else {
      console.log(`Skipping audio frames. Current index: ${index}, Interaction count: ${interactionCount}`);
    }
  };

  const sendBufferedAudio = async (audioBuffer, ws, streamSid) => {
    const frameSize = 160;
    const frameDurationMs = 20;
    console.log(`Starting to send buffered audio. Total size: ${audioBuffer.length}`);

    for (let i = 0; i < audioBuffer.length; i += frameSize) {
      if (ws.readyState !== ws.OPEN) {
        console.log('WebSocket is not open. Stopping audio frame transmission.');
        break;
      }

      const frame = audioBuffer.slice(i, i + frameSize);
      const frameBase64 = frame.toString('base64');

      ws.send(JSON.stringify({
        event: 'media',
        streamSid: streamSid,
        media: {
          payload: frameBase64
        }
      }));

      await new Promise(resolve => setTimeout(resolve, frameDurationMs));
    }
    console.log('Finished sending buffered audio');
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
        console.log('Processing start event...');
        streamSid = data.start.streamSid;
        callSid = data.start.callSid;

        // Log parameters
        console.log('Start event parameters:', {
          streamSid,
          callSid,
          customParameters: data.start.customParameters
        });

        if (data.start.customParameters && data.start.customParameters.phoneNumber) {
          phoneNumber = data.start.customParameters.phoneNumber;
          console.log(`Phone number from parameters: ${phoneNumber}`);
        }

        console.log('About to initialize Deepgram...');
        try {
          dgLive = initializeDeepgram({
            onOpen: async () => {
              console.log('Deepgram connection opened successfully');
              try {
                const initialMessage = 'Hello! May I know your name, please?';
                console.log('Generating TTS for initial message:', initialMessage);
                const ttsAudioBuffer = await generateTTS(initialMessage);
                console.log('TTS generated, buffer size:', ttsAudioBuffer.length);
                await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
                console.log('Initial message sent successfully');
              } catch (error) {
                console.error('Error in initial message flow:', error);
              }
            },
            onTranscript: async (transcript) => {
              console.log('Received transcript:', transcript);
              if (transcript.trim()) {
                console.log('Processing transcript:', transcript);
                const response = await processTranscript(transcript, callerName);
                if (response) {
                  console.log('Generating TTS for response:', response);
                  const ttsAudioBuffer = await generateTTS(response);
                  await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
                }
              }
            },
            onError: (error) => {
              console.error('Deepgram error:', error);
            },
            onClose: () => {
              console.log('Deepgram Live Transcription connection closed.');
            }
          });
          console.log('Deepgram initialization completed');
        } catch (error) {
          console.error('Failed to initialize Deepgram:', error);
        }

      } else if (data.event === 'media') {
        console.log('Received media event, payload size:', data.media.payload.length);
        const audioBufferData = Buffer.from(data.media.payload, 'base64');
        if (dgLive && dgLive.getReadyState() === 1) {
          dgLive.send(audioBufferData);
          console.log('Sent audio data to Deepgram');
        } else {
          console.log('Queuing audio data, Deepgram not ready');
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

  // Add error handler
  ws.on('error', (error) => {
    console.error('WebSocket error occurred:', error);
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
  twilioStreamWebhook
};