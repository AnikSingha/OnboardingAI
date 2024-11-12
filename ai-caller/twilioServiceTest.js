const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;

// Basic call initiation endpoint
router.post('/call-leads', async (req, res) => {
  try {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('Initiating call to:', req.body.to); // Debug log

    const call = await client.calls.create({
      url: 'https://api.onboardingai.org/twilio-stream',
      to: req.body.to,
      from: req.body.from,
      statusCallback: 'https://api.onboardingai.org/call-status',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });

    console.log('Call initiated with SID:', call.sid); // Debug log
    res.json({ success: true, callSid: call.sid });

  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status callback to see what's happening
router.post('/call-status', (req, res) => {
  console.log('Call status update:', req.body);
  res.sendStatus(200);
});

// The webhook that Twilio calls when the call connects
router.post('/twilio-stream', (req, res) => {
  console.log('Twilio webhook hit'); // Debug log
  
  const twiml = new VoiceResponse();
  
  // Add a pause to ensure connection
  twiml.pause({ length: 2 });
  
  // Add a simple message to test if the call works
  twiml.say('Hello, this is a test call from OnboardAI.');
  
  // Add another pause
  twiml.pause({ length: 1 });
  
  console.log('TwiML generated:', twiml.toString()); // Debug log
  
  res.type('text/xml');
  res.send(twiml.toString());
});