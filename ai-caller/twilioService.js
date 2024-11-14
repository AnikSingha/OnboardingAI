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

  console.log('WebSocket connection established', {
    phoneNumber,
    query: req.query,
    headers: req.headers
  });

  // Add heartbeat to prevent timeout
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('pong', () => {
    console.log('Received pong from client');
  });

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

      ws.send(JSON.stringify({
        event: 'media',
        streamSid: streamSid,
        media: {
          payload: frameBase64
        }
      }));

      await new Promise(resolve => setTimeout(resolve, frameDurationMs));
    }
  };

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', {
        event: data.event,
        streamSid: data.start?.streamSid,
        callSid: data.start?.callSid
      });
      
      if (data.event === 'start') {
        console.log('Start event data:', JSON.stringify(data, null, 2));
        streamSid = data.start.streamSid;
        callSid = data.start.callSid;

        if (data.start.customParameters && data.start.customParameters.phoneNumber) {
          phoneNumber = data.start.customParameters.phoneNumber;
        }

        console.log('Initializing Deepgram...');
        dgLive = initializeDeepgram({
          onOpen: async () => {
            console.log('Deepgram Live Transcription connection opened.');
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
      console.error('Error processing WebSocket message:', error);
    }
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
  console.log('Twilio webhook hit');
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
};

module.exports = {
  handleWebSocket,
  twilioStreamWebhook
};