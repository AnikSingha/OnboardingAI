const twilio = require('twilio');
const { generateTTS, processTranscript, initializeDeepgram } = require('./deepgramService.js');
const { v4: uuidv4 } = require('uuid');
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const { updateLeadInfo, getDb } = require('./database.js');
const dotenv = require('dotenv');
const WebSocket = require('ws');

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const DEBOUNCE_DELAY = 1000;
const PROCESSING_TIMEOUT = 5000;

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
  let pendingTranscript = '';
  let debounceTimer = null;
  
  const processTranscription = async (transcript) => {
    if (!transcript.trim()) {
      console.log('Empty transcript received, skipping processing');
      return;
    }
    
    try {
      console.log('Processing transcript:', transcript, 'isProcessing:', isProcessing, 'callerName:', callerName);
      
      if (isProcessing) {
        console.log('Already processing, queuing transcript');
        pendingTranscript = transcript;
        return;
      }
      
      isProcessing = true;

      if (!callerName) {
        const extractedName = await processTranscript(transcript, true);
        if (extractedName) {
          callerName = extractedName;
          console.log(`Caller name captured: ${callerName}`);
          
          if (phoneNumber) {
            await updateLeadInfo(phoneNumber, {
              _number: phoneNumber,
              name: callerName
            }).catch(err => console.error('Failed to update lead info:', err));
          }

          const responseMessage = `Nice to meet you, ${callerName}. How can I assist you today?`;
          console.log('Sending greeting response:', responseMessage);
          const ttsAudioBuffer = await generateTTS(responseMessage);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
        }
      } else {
        // Only process non-empty transcripts after name capture
        const response = await processTranscript(transcript, false);
        if (response) {
          console.log('Generated response:', response);
          const ttsAudioBuffer = await generateTTS(response);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
          console.log('Response sent successfully');
        }
      }
    } catch (error) {
      console.error('Error in processTranscription:', error);
    } finally {
      isProcessing = false;
      if (pendingTranscript) {
        const pending = pendingTranscript;
        pendingTranscript = '';
        await processTranscription(pending);
      }
    }
  };

  const dgLive = initializeDeepgram({
    onOpen: async () => {
      console.log('Deepgram connection opened');
      try {
        const initialMessage = 'Hello! May I know your name, please?';
        if (streamSid) {
          const ttsAudioBuffer = await generateTTS(initialMessage);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
        }
      } catch (error) {
        console.error('Error in initial message flow:', error);
      }
    },
    onTranscript: async (transcript, isSpeechFinal) => {
      if (!transcript.trim()) return;
      console.log('Received transcript:', transcript, 'isSpeechFinal:', isSpeechFinal);

      try {
        if (isSpeechFinal) {
          console.log('Processing speech-final transcript immediately');
          await processTranscription(transcript);
        } else {
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }

          console.log('Setting up debounced processing');
          debounceTimer = setTimeout(async () => {
            try {
              await processTranscription(transcript);
            } catch (error) {
              console.error('Error in debounced processing:', error);
            }
          }, DEBOUNCE_DELAY);
        }
      } catch (error) {
        console.error('Error in onTranscript:', error);
      }
    },
    onUtteranceEnd: async (lastWordEnd) => {
      if (pendingTranscript) {
        await processTranscription(pendingTranscript);
        pendingTranscript = '';
      }
    },
    onError: (error) => {
      console.error('Deepgram error:', error);
    },
    onClose: () => {
      console.log('Deepgram connection closed');
    }
  });

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
  </Response>
`;
  res.type('text/xml');
  res.send(response);
  console.log('Twilio webhook response sent with phone number:', phoneNumber);
};

const callLeads = async (req, res) => {
  try {
    const db = await getDb();
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
    res.status(500).json({ error: 'Failed to initiate calls' });
  }
};

module.exports = {
  handleWebSocket,
  twilioStreamWebhook,
  callLeads,
  makeCall
};
