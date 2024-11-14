const express = require('express');
const router = express.Router();
const expressWs = require('express-ws');
const WebSocket = require('ws');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { handleWebSocket, twilioStreamWebhook } = require('../twilioService');

// Initialize WebSocket server
const wsServer = expressWs(router);

// CORS headers for WebSocket
wsServer.getWss().on('headers', (headers, req) => {
  const origin = req.headers.origin;
  if (origin === 'https://www.onboardingai.org' || origin === 'https://test.onboardingai.org') {
    headers.push('Access-Control-Allow-Origin: ' + origin);
    headers.push('Access-Control-Allow-Credentials: true');
  }
});

// Call initiation endpoint
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

    // Initialize WebSocket before making the call
    const ws = new WebSocket(`wss://api.onboardingai.org/call-leads/media`);

    // Add error handler
    ws.on('error', (error) => {
      console.error('WebSocket error for:', number, error);
      ws.close();
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: 'WebSocket connection error' 
        });
      }
    });

    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        console.error('WebSocket connection timeout for:', number);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            error: 'WebSocket connection timeout' 
          });
        }
      }
    }, 10000); // 10 second timeout

    ws.on('open', async () => {
      try {
        clearTimeout(connectionTimeout); // Clear timeout on successful connection
        console.log('WebSocket connection established for:', number);
        
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        const call = await client.calls.create({
          url: 'https://api.onboardingai.org/call-leads/twilio-stream',
          to: number,
          from: fromNumber,
          statusCallback: 'https://api.onboardingai.org/call-leads/call-status',
          statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
          statusCallbackMethod: 'POST'
        });

        ws.on('close', () => {
          console.log(`Call ended for ${number}, closing WebSocket`);
        });

        console.log('Call initiated with SID:', call.sid);
        res.json({ success: true, callSid: call.sid });
      } catch (error) {
        console.error('Error in WebSocket open handler:', error);
        ws.close();
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error.code || 'Unknown error code'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.code || 'Unknown error code'
      });
    }
  }
});

router.post('/call-status', (req, res) => {
  const callStatus = req.body.CallStatus;
  const callSid = req.body.CallSid;
  console.log('Call Status Update:', { callStatus, callSid });
  res.sendStatus(200);
});

// WebSocket endpoint for media handling
router.ws('/media', (ws, req) => {
  console.log('WebSocket connection received', {
    query: req.query,
    headers: req.headers
  });
  handleWebSocket(ws, req);
});

// Twilio webhook endpoint
router.post('/twilio-stream', twilioStreamWebhook);

module.exports = router;