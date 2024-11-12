const express = require('express');
const expressWs = require('express-ws');
const router = express.Router();
expressWs(router);

const { callLeads, twilioStreamWebhook } = require('../twilioService.js');

router.post('/call-leads', async (req, res) => {
  console.log("Lead Call Initiated");
  try {
    await callLeads(req, res);
  } catch (error) {
    console.error('Error in call-leads endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error initiating calls: ${error.message}` 
    });
  }
});

router.post('/twilio-stream', twilioStreamWebhook);

router.ws('/media', (ws, req) => {
  ws.on('message', (msg) => {
    console.log('Received WebSocket message:', msg);
  });
  ws.on('close', () => console.log('WebSocket closed'));
});

module.exports = router;