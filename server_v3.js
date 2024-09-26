require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const axios = require('axios');
const http = require('http');
const WebSocketServer = require('websocket').server;
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const fs = require('fs');
const winston = require('winston');

// Initialize Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Validate Required Environment Variables
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'DEEPGRAM_API_KEY',
  'OPENAI_API_KEY',
  'PUBLIC_URL'
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    logger.error(`Missing required environment variable: ${varName}`);
    process.exit(1); // Exit the application if a required variable is missing
  }
});

// Create Express app
const app = express();
const port = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// Initialize Deepgram SDK client for STT
const deepgramSDK = createClient(process.env.DEEPGRAM_API_KEY, {
  listen: { 
    fetch: { options: { url: "https://api.deepgram.com" } } 
  }
});

// Initialize Deepgram Axios client for TTS
const deepgramTTS = axios.create({
  baseURL: 'https://api.deepgram.com',
  headers: {
    'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Endpoint to handle incoming calls
app.post('/twiml', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const ngrokDomain = process.env.PUBLIC_URL;

  twiml.connect().stream({
    url: `wss://${ngrokDomain}/media-stream`,
    track: 'inbound_track' // Enables only inbound audio for bidirectional streams
  });
  logger.info('TwiML response:', twiml.toString());
  res.type('text/xml');
  res.send(twiml.toString());
});

// WebSocket server handling
const wss = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wss.on('request', (request) => {
  logger.info('WebSocket connection attempt:', request.resourceURL.pathname);

  if (request.resourceURL.pathname === '/media-stream') {
    const connection = request.accept(null, request.origin);
    logger.info('WebSocket connection accepted');
    new MediaStream(connection);
  } else {
    request.reject(404, 'Not Found');
    logger.warn(`Rejected WebSocket connection to invalid path: ${request.resourceURL.pathname}`);
  }
});

class MediaStream {
  constructor(connection) {
    logger.info('MediaStream instance created');
    this.connection = connection;
    this.connection.on('message', this.processMessage.bind(this));
    this.connection.on('close', this.close.bind(this));
    this.connection.on('error', this.handleError.bind(this));
    this.streamSid = null;
    this.hasGreeted = false;
    this.silenceTimer = null; // Initialize silence timer
    this.isListening = false; // Add this flag
    this.deepgramReady = false;
    this.initializeDeepgram();
    this.sendInitialGreeting(); // Add this line to send the greeting when a new connection is established
  }

  // Initialize Deepgram Live Transcription
  initializeDeepgram() {
    logger.info('Initializing Deepgram connection');

    // Create a new Deepgram client using createClient
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    this.dgSocket = deepgram.listen.live({
      language: 'en-US',
      punctuate: true,
      interim_results: true,
      utterance_end_ms: 1000, // 1 second
    });

    // Event Listeners
    this.dgSocket.on(LiveTranscriptionEvents.Open, () => {
      logger.info('Deepgram connection opened');
      this.deepgramReady = true;
    });

    this.dgSocket.on(LiveTranscriptionEvents.Close, () => {
      logger.info('Deepgram connection closed');
      this.deepgramReady = false;
    });

    this.dgSocket.on(LiveTranscriptionEvents.Error, (error) => {
      logger.error('Deepgram error:', error.message, error.stack);
      this.deepgramReady = false;
    });

    this.dgSocket.on(LiveTranscriptionEvents.Transcript, (transcription) => {
      logger.info('Received transcription from Deepgram:', JSON.stringify(transcription));
      const transcriptText = transcription.channel.alternatives[0].transcript;
      if (transcriptText) {
        logger.info('Transcription:', transcriptText);
        this.generateAndSendResponse(transcriptText);
      } else {
        logger.warn('Received empty transcript from Deepgram');
      }
    });

    this.dgSocket.on(LiveTranscriptionEvents.UtteranceEnd, (utteranceEnd) => {
      logger.info('Received UtteranceEnd:', JSON.stringify(utteranceEnd));
      this.handleUtteranceEnd(utteranceEnd);
    });

    // Add a timeout to check if the connection was established
    setTimeout(() => {
      if (!this.deepgramReady) {
        logger.error('Deepgram connection not established after 5 seconds');
        this.initializeDeepgram(); // Try to reinitialize
      }
    }, 5000);

    logger.info('Deepgram connection initialization attempted');
  }

  // Initialize or reset the silence timer
  resetSilenceTimer() {
    const SILENCE_DURATION_MS = 30000; // Increase to 30 seconds
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      logger.info('Silence detected, initiating stream closure');
      this.close();
    }, SILENCE_DURATION_MS);
  }

  async sendInitialGreeting() {
    logger.info('Attempting to send initial greeting');
    if (!this.hasGreeted) {
      const greeting = "Hello! How can I assist you today?";
      logger.info('Generating speech for greeting:', greeting);
      try {
        const speechAudio = await this.synthesizeSpeechWithDeepgram(greeting);
        if (speechAudio) {
          logger.info('Speech generated successfully');
          logger.info(`Audio Buffer Length: ${speechAudio.length} bytes`);

          // Optional: Save the audio to a file for debugging
          fs.writeFileSync('greeting_audio.mulaw', speechAudio);
          logger.info('Saved greeting audio to greeting_audio.mulaw');

          await this.sendAudioToTwilio(speechAudio);
          this.hasGreeted = true;
          logger.info('Initial greeting sent successfully');

          // Reset the silence timer to wait for user input
          this.resetSilenceTimer();
          this.isListening = true; // Set to true after greeting
        } else {
          logger.warn('Failed to generate speech for greeting');
        }
      } catch (error) {
        logger.error('Error sending initial greeting:', error);
      }
    } else {
      logger.info('Greeting has already been sent');
    }
  }

  async synthesizeSpeechWithDeepgram(text) {
    try {
      logger.info('Sending TTS request to Deepgram');

      const url = `/v1/speak?model=aura-helios-en&encoding=mulaw&sample_rate=8000`;

      const response = await deepgramTTS.post( // Change deepgram to deepgramTTS
        url,
        { text }, // Request body
        {
          responseType: 'arraybuffer', // Receive audio as binary data
        }
      );

      logger.info('TTS response received');

      // Convert the response data to a Buffer
      const audioBuffer = Buffer.from(response.data);

      logger.info(`Received audio buffer of length: ${audioBuffer.length} bytes`);
      return audioBuffer;
    } catch (error) {
      if (error.response && error.response.data) {
        logger.error('Deepgram TTS Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        logger.error('Error synthesizing speech with Deepgram:', error);
      }
      return null;
    }
  }

  async sendAudioToTwilio(audioBuffer) {
    return new Promise((resolve, reject) => {
      const chunkSize = 160; // 20ms of 8kHz mu-law audio
      let offset = 0;

      const sendChunk = () => {
        if (offset >= audioBuffer.length) {
          logger.info('Finished streaming audio to Twilio');
          resolve();
          return;
        }

        const chunk = audioBuffer.slice(offset, offset + chunkSize);
        offset += chunkSize;

        const payload = chunk.toString('base64');
        const message = {
          event: 'media',
          streamSid: this.streamSid,
          media: {
            payload
          }
        };

        this.connection.sendUTF(JSON.stringify(message));
        setTimeout(sendChunk, 20); // Send every 20ms
      };

      logger.info('Starting to stream audio to Twilio');
      sendChunk();
    });
  }

  async handleUtteranceEnd(utteranceEnd) {
    logger.info('Handling UtteranceEnd:', JSON.stringify(utteranceEnd));
    // Instead of closing, reset the silence timer to wait for further input
    this.resetSilenceTimer();
  }

  async generateAndSendResponse(transcriptText) {
    try {
      logger.info('Generating AI response for:', transcriptText);
      const aiText = await this.generateAIResponse(transcriptText);
      logger.info('AI response generated:', aiText);
      logger.info('Synthesizing speech for AI response');
      const speechAudio = await this.synthesizeSpeechWithDeepgram(aiText);
      if (speechAudio) {
        logger.info('Speech synthesized successfully');
        logger.info(`Audio Buffer Length: ${speechAudio.length} bytes`);

        // Optional: Save the audio to a file for debugging
        fs.writeFileSync('ai_response_audio.mulaw', speechAudio);
        logger.info('Saved AI response audio to ai_response_audio.mulaw');

        await this.sendAudioToTwilio(speechAudio);
        logger.info('AI response sent successfully');

        // Reset the silence timer to wait for further user input
        this.resetSilenceTimer();
      } else {
        logger.warn('Failed to synthesize speech for AI response');
      }
    } catch (error) {
      logger.error('Error in generate and send response:', error);
    }
  }

  async generateAIResponse(transcriptText) {
    try {
      logger.info('Sending request to OpenAI');
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Corrected model name
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: transcriptText }
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const aiText = openaiResponse.data.choices[0].message.content.trim();
      logger.info('AI Response:', aiText);
      return aiText;
    } catch (error) {
      logger.error('Error generating AI response:', error.response ? error.response.data : error);
      return 'Sorry, I am having trouble processing your request.';
    }
  }

  processMessage(message) {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      logger.debug('Received UTF8 message:', data.event);
      if (data.event === 'start' && data.streamSid) {
        this.setStreamSid(data.streamSid);
        this.sendInitialGreeting();
      } else if (data.event === 'media') {
        logger.debug('Received media event');
        this.handleMediaData(Buffer.from(data.media.payload, 'base64'));
      }
    } else if (message.type === 'binary') {
      this.handleMediaData(message.binaryData);
    }
  }

  handleMediaData(data) {
    this.resetSilenceTimer();

    if (this.deepgramReady && this.dgSocket) {
      try {
        this.dgSocket.send(data);
        if (!this.isListening) {
          logger.info('Started receiving audio input');
          this.isListening = true;
        }
      } catch (error) {
        logger.error('Error sending data to Deepgram:', error);
        this.deepgramReady = false;
        this.initializeDeepgram(); // Try to reinitialize on error
      }
    } else {
      logger.warn('Deepgram socket is not ready. Buffering or discarding audio.');
      // Optionally, you could buffer the audio here and send it when the connection is ready
    }
  }

  async close() {
    logger.info('Closing MediaStream');
    if (this.dgSocket) {
      try {
        await this.dgSocket.finish(); // Ensure that finish() correctly finalizes the stream
        logger.info('Deepgram stream finalized');
      } catch (error) {
        logger.error('Error finalizing Deepgram stream:', error);
      }
    }
    if (this.connection) {
      this.connection.close(); // Closes the WebSocket connection
      logger.info('WebSocket connection closed');
    }
  }

  handleError(error) {
    logger.error('WebSocket error:', error.message, error.stack);
  }

  // Add a method to set the streamSid
  setStreamSid(streamSid) {
    this.streamSid = streamSid;
    logger.info(`Stream SID set: ${this.streamSid}`);
  }
}

// Start the server
server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
