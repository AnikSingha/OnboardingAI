const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { handleWebSocket } = require('../twilioService');

router.post('/', async (req, res) => {
  try {
    const { name, number } = req.body;
    
    if (!number) {
      console.error('Missing required parameter:', { number });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: phone number is required' 
      });
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      console.error('Missing Twilio phone number configuration');
      return res.status(500).json({ 
        success: false, 
        error: 'Twilio phone number not configured' 
      });
    }

    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const call = await client.calls.create({
      url: 'https://api.onboardingai.org/call-leads/twilio-stream',
      to: number,
      from: fromNumber,
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

// Add the webhook endpoints
router.post('/twilio-stream', (req, res) => {
  console.log('Twilio webhook hit');
  const phoneNumber = req.query.phoneNumber || req.body.to;
  
  const twiml = new VoiceResponse();
  twiml.connect().stream({
    url: `wss://${req.headers.host}/media`,
    track: 'both'
  }).parameter({
    name: 'phoneNumber',
    value: phoneNumber
  });
  
  console.log('TwiML generated:', twiml.toString());
  res.type('text/xml');
  res.send(twiml.toString());
});

router.ws('/media', (ws, req) => {
  handleWebSocket(ws, req);
});

module.exports = router;