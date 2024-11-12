// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import expressWs from 'express-ws';
import { connectToMongoDB } from './database.js';
import { callLeads, twilioStreamWebhook } from './twilioService.js';
import cors from 'cors';

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectToMongoDB();

app.use(cors({
  origin: ['https://onboardingai.org', 'https://api.onboardingai.org'],
  credentials: true
}));


// Twilio Stream Webhook
app.post('/twilio-stream', twilioStreamWebhook);

// WebSocket endpoint to handle incoming audio from Twilio
app.ws('/media', (ws, req) => {
  // WebSocket handling logic will be moved here
  // This will include the logic for handling audio frames, etc.
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});