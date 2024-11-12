const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;

// Initiate a call
router.post('/', async (req, res) => {
  try {
    const { to, from } = req.body;
    
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: to number is required' 
      });
    }

    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('Initiating call to:', to);

    const call = await client.calls.create({
      url: 'https://api.onboardingai.org/call-leads/twilio-stream',
      to: to,
      from: from || process.env.TWILIO_PHONE_NUMBER,
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

// Status callback endpoint
router.post('/call-status', (req, res) => {
  console.log('Call status update:', req.body);
  res.sendStatus(200);
});

// TwiML webhook endpoint
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

module.exports = router;