const express = require('express');
const router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { handleWebSocket, twilioStreamWebhook } = require('../twilioService');
const app = require('../../auth-service/server');

// WebSocket endpoint
router.ws('/media', (ws, req) => {
  console.log('WebSocket connection attempt received', {
    url: req.url,
    query: req.query,
    headers: req.headers
  });

  let wsHandler;
  let pingInterval;
  ws.isAlive = true;

  // Cleanup function to handle resources
  const cleanup = () => {
    console.log('Cleaning up WebSocket resources');
    if (pingInterval) {
      clearInterval(pingInterval);
    }
    if (wsHandler && wsHandler.cleanup) {
      wsHandler.cleanup();
    }
    ws.isAlive = false;
  };

  // Error handler
  const handleError = (error) => {
    console.error('WebSocket error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    if (ws.readyState === ws.OPEN) {
      ws.close(1011, 'Internal Server Error');
    }
  };

  try {
    console.log('Initializing WebSocket handler');
    wsHandler = handleWebSocket(ws);

    // Set up ping interval for connection health check
    pingInterval = setInterval(() => {
      if (!ws.isAlive) {
        console.log('Client not responding to pings, terminating connection');
        cleanup();
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    }, 30000);

    // WebSocket event handlers
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', (code, reason) => {
      console.log('WebSocket connection closed:', {
        code,
        reason,
        timestamp: new Date().toISOString()
      });
      cleanup();
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      handleError(error);
      cleanup();
    });

  } catch (error) {
    console.error('Error during WebSocket initialization:', error);
    handleError(error);
    cleanup();
    return;
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

    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const call = await client.calls.create({
      url: `https://api.onboardingai.org/call-leads/twilio-stream?phoneNumber=${encodeURIComponent(number)}`,
      to: number,
      from: fromNumber,
      statusCallback: `${process.env.BASE_URL}/call-leads/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      timeout: 30
    });

    console.log('Call initiated:', {
      sid: call.sid,
      to: number,
      from: fromNumber,
      status: call.status
    });

    res.json({ success: true, callSid: call.sid });

  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.code || 'Unknown error code'
    });
  }
});

router.post('/call-status', (req, res) => {
  const callStatus = req.body.CallStatus;
  const callSid = req.body.CallSid;
  const callDuration = req.body.CallDuration;
  const from = req.body.From;
  const to = req.body.To;
  
  console.log('Raw Call Status Update:', {
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  res.sendStatus(200);
});

router.post('/inbound', (req, res) => {
  console.log('Inbound call received:', {
    from: req.body.From,
    to: req.body.To,
    callSid: req.body.CallSid
  });

  const response = new VoiceResponse();
  response.connect().stream({
    url: 'wss://api.onboardingai.org/call-leads/media',
    track: 'inbound_track'
  });
  
  response.pause({ length: 60 });

  res.type('text/xml');
  res.send(response.toString());
});


// Twilio webhook endpoint
router.post('/twilio-stream', twilioStreamWebhook);

module.exports = router;