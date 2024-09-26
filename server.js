require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const axios = require('axios');
const path = require('path');
const http = require('http');
const WebSocketServer = require('websocket').server;
const { createClient } = require("@deepgram/sdk");
const { spawn } = require('child_process');

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

// Initialize Deepgram client
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Endpoint to handle incoming calls
app.post('/twiml', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const ngrokDomain = process.env.PUBLIC_URL;

  twiml.connect().stream({
    url: `wss://${ngrokDomain}/media-stream`,
    track: 'inbound_track'
  });
  console.log('TwiML response:', twiml.toString());
  res.type('text/xml');
  res.send(twiml.toString());
});

// WebSocket server handling
const wss = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wss.on('request', (request) => {
  console.log('WebSocket connection attempt:', request.resourceURL.pathname);
  
  if (request.resourceURL.pathname === '/media-stream') {
    const connection = request.accept(null, request.origin);
    console.log('WebSocket connection accepted');
    new MediaStream(connection);
  } else {
    request.reject(404, 'Not Found');
    console.log(`Rejected WebSocket connection to invalid path: ${request.resourceURL.pathname}`);
  }
});

class MediaStream {
  constructor(connection) {
    console.log('MediaStream instance created');
    this.connection = connection;
    this.connection.on('message', this.processMessage.bind(this));
    this.connection.on('close', this.close.bind(this));
    this.connection.on('error', this.handleError.bind(this));
    this.streamSid = null;
    this.hasGreeted = false;
    this.initializeDeepgram();
    console.log('MediaStream instance created');
  }

  initializeDeepgram() {
    console.log('Initializing Deepgram connection');
    this.dgSocket = deepgram.listen.live({
      language: 'en-US',
      punctuate: true,
      interim_results: false,
    });
  this.dgSocket.addListener('open', () => console.log('Deepgram connection opened'));
  this.dgSocket.addListener('close', () => console.log('Deepgram connection closed'));
  this.dgSocket.addListener('transcription', (transcription) => {
    console.log('Received transcription from Deepgram:', JSON.stringify(transcription));
    const transcriptText = transcription.channel.alternatives[0].transcript;
    if (transcriptText) {
      console.log('Transcription:', transcriptText);
      this.generateAndSendResponse(transcriptText);
    } else {
      console.log('Received empty transcription');
    }
  });

    this.dgSocket.addListener('error', (error) => {
      console.error('Deepgram error:', error);
    });

    console.log('Deepgram connection initialized');
  }
  async sendInitialGreeting() {
    console.log('Attempting to send initial greeting');
    if (!this.hasGreeted) {
      const greeting = "Hello! How can I assist you today?";
      console.log('Generating speech for greeting:', greeting);
      try {
        const speechAudio = await this.synthesizeSpeechWithDeepgram(greeting);
        if (speechAudio) {
          console.log('Speech generated, sending to Twilio');
          await this.sendAudioToTwilio(speechAudio);
          this.hasGreeted = true;
          console.log('Initial greeting sent successfully');
        } else {
          console.log('Failed to generate speech for greeting');
        }
      } catch (error) {
        console.error('Error sending initial greeting:', error);
      }
    } else {
      console.log('Greeting has already been sent');
    }
  }

  processMessage(message) {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      console.log('Received message type:', data.event);
      
      switch(data.event) {
        case 'connected':
          console.log('Connected event received:', data);
          break;
        case 'start':
          console.log('Start event received:', data);
          this.streamSid = data.start.streamSid;
          break;
        case 'media':
          this.handleMediaData(data);
          break;
        case 'stop':
          console.log('Stop event received:', data);
          this.close();
          break;
      }
    } else if (message.type === 'binary') {
      this.handleBinaryData(message.binaryData);
    }
  }

  handleMediaData(data) {
    if (data.media && data.media.payload) {
      const audioChunk = Buffer.from(data.media.payload, 'base64');
      console.log(`Sending ${audioChunk.length} bytes to Deepgram`);
      this.dgSocket.send(audioChunk);
    } else {
      console.log('Received media event without payload');
    }
  }

  handleBinaryData(data) {
    this.dgSocket.send(data);
  }

  async generateAndSendResponse(transcriptText) {
    try {
      const aiText = await this.generateAIResponse(transcriptText);
      const speechAudio = await this.synthesizeSpeechWithDeepgram(aiText);
      if (speechAudio) {
        this.sendAudioToTwilio(speechAudio);
      }
    } catch (error) {
      console.error('Error in generate and send response:', error);
    }
  }

  async generateAIResponse(transcriptText) {
    try {
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
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
      console.log('AI Response:', aiText);
      return aiText;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Sorry, I am having trouble processing your request.';
    }
  }

  async synthesizeSpeechWithDeepgram(text) {
    try {
      const response = await axios.post(
        'https://api.deepgram.com/v1/tts',
        { text, voice: 'en-US' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          },
          responseType: 'arraybuffer',
        }
      );

      return this.transcodeAudio(Buffer.from(response.data));
    } catch (error) {
      console.error('Error synthesizing speech with Deepgram:', error);
      return null;
    }
  }

  transcodeAudio(inputBuffer) {
    return new Promise((resolve, reject) => {
      const args = [
        '-f', 'mp3',
        '-i', 'pipe:0',
        '-ar', '8000',
        '-ac', '1',
        '-f', 'mulaw',
        'pipe:1',
      ];

      const ffmpeg = spawn('ffmpeg', args);
      const chunks = [];

      ffmpeg.stdin.write(inputBuffer);
      ffmpeg.stdin.end();

      ffmpeg.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      ffmpeg.stdout.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error('FFmpeg error:', data.toString());
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  sendAudioToTwilio(audioBuffer) {
    return new Promise((resolve, reject) => {
      const chunkSize = 320;
      let offset = 0;
  
      const sendChunk = () => {
        if (offset >= audioBuffer.length) {
          console.log('Finished streaming audio to Twilio');
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
        setTimeout(sendChunk, 20);
      };
  
      console.log('Starting to stream audio to Twilio');
      sendChunk();
    });
  }

  close() {
    console.log('Closing MediaStream');
    if (this.dgSocket) {
      this.dgSocket.finish();
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
  }
}

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});