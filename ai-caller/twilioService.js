const twilio = require('twilio');
const { generateTTS, processTranscript, initializeDeepgram } = require('./deepgramService.js');
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

const makeCall = async (to) => {
  try {
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL}/twilio-stream?phoneNumber=${encodeURIComponent(to)}`,
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
  let streamSid;
  let callSid;
  let audioBufferQueue = [];
  let phoneNumber;
  let interactionCount = 0;
  let callerName = '';
  let isProcessing = false;
  const DEEPGRAM_RESPONSE_INTERVAL = 2000;

  // Debounce timer and accumulation buffer
  let debounceTimer = null;
  const DEBOUNCE_DELAY = 3000; // 3 seconds
  let finalResult = '';
  let speechFinal = false;

  console.log('Twilio WebSocket connection established', {
    headers: req.headers,
    query: req.query
  });

  // Initialize Deepgram connection
  console.log('Creating Deepgram connection...');
  const dgLive = initializeDeepgram({
    onOpen: async () => {
      console.log('Deepgram connection opened');
      try {
        const initialMessage = 'Hello! May I know your name, please?';
        console.log('Sending initial message to user:', initialMessage);
        if (streamSid) {  // Only send if we have streamSid
          const ttsAudioBuffer = await generateTTS(initialMessage);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
        } else {
          console.log('Waiting for streamSid before sending initial message');
        }
      } catch (error) {
        console.error('Error in initial message flow:', error);
      }
    },
    onTranscript: async (transcript) => {
      console.log('Received transcript from Deepgram:', transcript);

      // Accumulate transcript fragments
      if (transcript.trim()) {
        finalResult += ` ${transcript.trim()}`;
        console.log(`Accumulated Transcript: "${finalResult.trim()}"`);

        // Reset debounce timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          console.log('Debounce period ended. Processing accumulated transcript.');

          if (finalResult.trim()) {
            if (!callerName) {
              const extractedName = await processTranscript(finalResult.trim(), true);
              if (extractedName) {
                callerName = extractedName;
                console.log(`Caller name captured: ${callerName}`);
                
                if (phoneNumber) {
                  await updateLeadInfo(phoneNumber, {
                    _number: phoneNumber,
                    name: callerName
                  });
                  console.log(`Lead info updated for phone number: ${phoneNumber}`);
                }

                const responseMessage = `Nice to meet you, ${callerName}. How can I assist you today?`;
                const ttsAudioBuffer = await generateTTS(responseMessage);
                await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
                finalResult = ''; // Clear the buffer after processing
                return;
              }
            }

            const response = await processTranscript(finalResult.trim());
            if (response) {
              console.log('Assistant response:', response);
              const ttsAudioBuffer = await generateTTS(response);
              await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
              console.log('Assistant response sent to Twilio.');
            }

            finalResult = ''; // Clear the buffer after processing
          }
        }, DEBOUNCE_DELAY);
      }
    },
    onError: (error) => {
      console.error('Deepgram connection error:', error);
    },
    onClose: () => {
      console.log('Deepgram connection closed');
    }
  });

  // Heartbeat to keep the connection alive
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
    if (index === interactionCount && ws.readyState === ws.OPEN && !isProcessing) {
      isProcessing = true; // Lock
      try {
        await sendBufferedAudio(audioBuffer, ws, streamSid);

        const markLabel = uuidv4();
        ws.send(JSON.stringify({
          event: 'mark',
          streamSid: streamSid,
          mark: { name: markLabel }
        }));
        interactionCount++;
      } finally {
        isProcessing = false; // Unlock
      }
    }
  };

  ws.on('message', async (message) => {
    if (isProcessing) {
      console.log('Skipping message because processing is locked');
      return;
    }

    try {
      const data = JSON.parse(message);

      if (data.event === 'start') {
        console.log('Start event data:', JSON.stringify(data, null, 2));
        streamSid = data.start.streamSid;
        callSid = data.start.callSid;
        
        if (data.start.customParameters?.phoneNumber) {
          phoneNumber = data.start.customParameters.phoneNumber;
          console.log(`Phone number from parameters: ${phoneNumber}`);
          
          // Process any queued audio now that we have streamSid
          if (audioBufferQueue.length > 0) {
            console.log('Processing queued audio...');
            while (audioBufferQueue.length > 0) {
              const audioData = audioBufferQueue.shift();
              dgLive.send(audioData);
            }
          }
        } else {
          console.error('No phone number in custom parameters');
        }

      } else if (data.event === 'media') {
        const audioBufferData = Buffer.from(data.media.payload, 'base64');
        if (dgLive.getReadyState() === 1) {
          dgLive.send(audioBufferData);
        } else {
          console.log('Deepgram not ready, queuing audio. Deepgram state:', dgLive.getReadyState());
          console.log('Queue size:', audioBufferQueue.length);
          audioBufferQueue.push(audioBufferData);
        }
      } else if (data.event === 'stop') {
        console.log('Stream stopped.');
        dgLive.finish();
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
    dgLive.finish();
    audioBufferQueue.length = 0;
  });
};

module.exports = { handleWebSocket, makeCall };