// twilioservice.js

const twilio = require('twilio');
const { generateTTS, processTranscript, initializeDeepgram } = require('./deepgramService.js');
const dotenv = require('dotenv');
const { getDb, updateLeadInfo } = require('../auth-service/db.js');

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const makeCall = async (to) => {
  try {
    const call = await twilioClient.calls.create({
      url: `https://api.onboardingai.org/call-leads/twilio-stream?phoneNumber=${encodeURIComponent(to)}`,
      to,
      from: TWILIO_PHONE_NUMBER,
    });
    console.log(`Call initiated, SID: ${call.sid}, to: ${to}`);
  } catch (error) {
    console.error(`Error initiating call to ${to}:`, error);
  }
};

const sendAudioFrames = async (audioBuffer, ws, streamSid, interactionCount) => {
  if (!streamSid) {
    console.error('No streamSid available for sending audio');
    return;
  }

  const chunkSize = 640;
  const markLabel = `response_${interactionCount}`;

  ws.send(JSON.stringify({
    streamSid,
    event: 'mark',
    mark: { name: markLabel },
  }));

  for (let i = 0; i < audioBuffer.length; i += chunkSize) {
    const chunk = audioBuffer.slice(i, i + chunkSize);
    ws.send(JSON.stringify({
      streamSid,
      event: 'media',
      media: { payload: chunk.toString('base64') },
    }));
    await new Promise((resolve) => setTimeout(resolve, 20)); // Throttle the sending to prevent buffer overflow
  }

  console.log(`Audio frames sent with mark: ${markLabel}`);
};

const handleWebSocket = (ws) => {
  let streamSid;
  let phoneNumber;
  let interactionCount = 0;
  let callerName = '';
  let isProcessing = false;
  let finalTranscript = '';

  const dgLive = initializeDeepgram({
    onOpen: async () => {
      console.log('Deepgram connection opened');
      if (streamSid) {
        const result = await processTranscript('', streamSid, null, phoneNumber);
        if (result.response) {
          const ttsAudioBuffer = await generateTTS(result.response);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
          interactionCount++;
        }
      }
    },
    onTranscript: async (transcription) => {
      if (!transcription.is_final) return;

      const transcript = transcription.channel.alternatives[0].transcript.trim();
      if (!transcript) return;

      finalTranscript += ` ${transcript}`;

      if (!transcription.speech_final && transcription.type !== 'UtteranceEnd') return;

      const completeTranscript = finalTranscript.trim();
      finalTranscript = '';

      if (isProcessing) return;

      isProcessing = true;

      try {
        const result = await processTranscript(completeTranscript, streamSid, callerName, phoneNumber);
        
        if (result.extractedName && !callerName) {
          callerName = result.extractedName;
          console.log(`Caller name captured: ${callerName}`);

          if (phoneNumber) {
            await updateLeadInfo(phoneNumber, {
              _number: phoneNumber,
              name: callerName,
            });
          }
        }

        if (result.response) {
          const ttsAudioBuffer = await generateTTS(result.response);
          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);
          interactionCount++;
        }
      } catch (error) {
        console.error('Error processing transcript:', error);
      } finally {
        isProcessing = false;
      }
    },
    onError: (error) => {
      console.error('Deepgram error:', error);
    },
    onClose: () => {
      console.log('Deepgram connection closed');
    },
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        phoneNumber = msg.start.customParameters?.phoneNumber;
        console.log(`Stream started, streamSid: ${streamSid}, phoneNumber: ${phoneNumber}`);
      } else if (msg.event === 'media') {
        if (dgLive && dgLive.getReadyState() === 1) {
          dgLive.send(Buffer.from(msg.media.payload, 'base64'));
        }
      } else if (msg.event === 'stop') {
        console.log('Stream stopped, cleaning up...');
        // Clear caches for this session
        conversationCache.delete(streamSid);
        ttsCache.delete(streamSid);
        responseCache.delete(streamSid);
        dgLive.finish();
        ws.close();
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);

  ws.on('pong', () => {
    console.log('Received pong from client');
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clearInterval(pingInterval);
    dgLive.finish();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(pingInterval);
    dgLive.finish();
  });
};

const twilioStreamWebhook = (req, res) => {
  const phoneNumber = req.query.phoneNumber || req.body.To || req.body.to;
  console.log('Twilio webhook received', { phoneNumber });

  const response = `
    <Response>
      <Connect>
        <Stream url="wss://api.onboardingai.org/call-leads/media">
          <Parameter name="phoneNumber" value="${phoneNumber}" />
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
  makeCall,
};
