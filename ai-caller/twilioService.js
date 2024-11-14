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
    try {
      const data = JSON.parse(message);
      
      if (data.event === 'start') {
        console.log('Start event data:', JSON.stringify(data, null, 2));
        streamSid = data.start.streamSid;
        callSid = data.start.callSid;

        if (data.start.customParameters && data.start.customParameters.phoneNumber) {
          phoneNumber = data.start.customParameters.phoneNumber;
        }


        await connectToMongoDB();
        console.log(`Stream started: ${streamSid} for phone number: ${phoneNumber}`);

        // Initialize Deepgram with callbacks
        dgLive = initializeDeepgram({
          onOpen: async () => {
            console.log('Deepgram Live Transcription connection opened.');
            const initialMessage = 'Hello! May I know your name, please?';
            console.log('Sending initial message to user:', initialMessage);
            const ttsAudioBuffer = await generateTTS(initialMessage);
            await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
          },
          onTranscript: async (transcript) => {
            if (transcript.trim()) {
              console.log('Final Transcription:', transcript);
              const response = await processTranscript(transcript, callerName);
              if (response) {
                console.log('AI Response:', response);
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