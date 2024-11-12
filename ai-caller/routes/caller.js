const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;

// Basic call initiation endpoint
router.post('/', async (req, res) => {
  try {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('Initiating call to:', req.body.to);

    const call = await client.calls.create({
      url: 'https://api.onboardingai.org/call-leads/twilio-stream',
      to: req.body.to,
      from: req.body.from,
      statusCallback: 'https://api.onboardingai.org/call-leads/call-status',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });

    console.log('Call initiated with SID:', call.sid);
    res.json({ success: true, callSid: call.sid });

  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status callback
router.post('/call-status', (req, res) => {
  console.log('Call status update:', req.body);
  res.sendStatus(200);
});

// Twilio webhook
router.post('/twilio-stream', (req, res) => {
  console.log('Twilio webhook hit');
  
  const twiml = new VoiceResponse();
  twiml.pause({ length: 2 });
  twiml.say('Hello, this is a test call from OnboardAI.');
  twiml.pause({ length: 1 });
  
  console.log('TwiML generated:', twiml.toString());
  
  res.type('text/xml');
  res.send(twiml.toString());
});

module.exports = router;  // Make sure to export the router