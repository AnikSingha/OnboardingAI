require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const axios = require('axios');
const http = require('http');
const WebSocketServer = require('websocket').server;
const { createClient } = require("@deepgram/sdk");
const { spawn } = require('child_process');
const alawmulaw = require('alawmulaw');
const fs = require('fs');

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
    this.silenceTimer = null;
    this.initializeDeepgram();
  }
  handleUtteranceEnd(utteranceEnd) {
    console.log('Handling UtteranceEnd:', JSON.stringify(utteranceEnd));
    // Finalize the transcription stream
    this.close();
  }

  initializeDeepgram() {
    console.log('Initializing Deepgram connection');

    const utteranceEndMs = 1000;
    this.dgSocket = deepgram.listen.live({
      language: 'en-US',
      punctuate: true,
      interim_results: true, // Required for UtteranceEnd
    utterance_end_ms: utteranceEndMs, // Enable UtteranceEnd
    });

    this.dgSocket.addListener('open', () => {
      console.log('Deepgram connection opened');
    });

    this.dgSocket.addListener('close', () => {
      console.log('Deepgram connection closed');
    });

    this.dgSocket.addListener('UtteranceEnd', (utteranceEnd) => {
      console.log('Received UtteranceEnd:', JSON.stringify(utteranceEnd));
      this.handleUtteranceEnd(utteranceEnd);
    });

    this.dgSocket.addListener('transcription', (transcription) => {
      console.log('Received transcription from Deepgram:', JSON.stringify(transcription));
      const transcriptText = transcription.channel.alternatives[0].transcript;
      if (transcriptText) {
        console.log('Transcription:', transcriptText);
        this.generateAndSendResponse(transcriptText);
      }
    });

    this.dgSocket.addListener('error', (error) => {
      console.error('Deepgram error:', error);
    });

    console.log('Deepgram connection initialized');
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
          this.sendInitialGreeting();
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
      console.log('Received binary message');
      this.handleBinaryData(message.binaryData);
    }
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

  handleMediaData(data) {
    if (data.media && data.media.payload) {
      const audioChunk = Buffer.from(data.media.payload, 'base64');
      console.log(`Received audio chunk of ${audioChunk.length} bytes`);
      this.dgSocket.send(audioChunk);
      console.log(`Sent ${audioChunk.length} bytes to Deepgram`);
  
      // Reset silence timer
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => {
        console.log('No audio received for 1.5 seconds, closing stream');
        this.close();
      }, 1500); // Adjusted to 1.5 seconds
    } else {
      console.log('Received media event without payload');
    }
  }  
  
  handleBinaryData(data) {
    console.log(`Sending ${data.length} bytes of binary data to Deepgram`);
    this.dgSocket.send(data);
  }

  async generateAndSendResponse(transcriptText) {
    try {
      console.log('Generating AI response for:', transcriptText);
      const aiText = await this.generateAIResponse(transcriptText);
      console.log('AI response generated:', aiText);
      console.log('Synthesizing speech for AI response');
      const speechAudio = await this.synthesizeSpeechWithDeepgram(aiText);
      if (speechAudio) {
        console.log('Speech synthesized, sending to Twilio');
        await this.sendAudioToTwilio(speechAudio);
        console.log('AI response sent successfully');
      } else {
        console.log('Failed to synthesize speech for AI response');
      }
    } catch (error) {
      console.error('Error in generate and send response:', error);
    }
  }

  async generateAIResponse(transcriptText) {
    try {
      console.log('Sending request to OpenAI');
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
      console.log('Sending TTS request to Deepgram');
  
      // Construct the URL with query parameters
      const url = `https://api.deepgram.com/v1/speak?model=aura-helios-en&encoding=mulaw&sample_rate=8000`;
  
      // Make the POST request with only the 'text' in the body
      const response = await axios.post(
        url,
        { text }, // Simplified body
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          },
          responseType: 'arraybuffer',
        }
      );
  
      console.log('TTS response received');
      const audioBuffer = Buffer.from(response.data);
      console.log(`Received audio buffer of length: ${audioBuffer.length} bytes`);
      console.log(`First few bytes: ${audioBuffer.slice(0, 20).toString('hex')}`);
  
      return audioBuffer;
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Deepgram TTS Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error synthesizing speech with Deepgram:', error);
      }
      return null;
    }
  }
  

  analyzeAudioFormat(filename) {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filename
      ]);

      let output = '';
      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe process exited with code ${code}`));
        } else {
          const result = JSON.parse(output);
          const audioStream = result.streams.find(stream => stream.codec_type === 'audio');
          resolve({
            codec: audioStream.codec_name,
            sample_rate: parseInt(audioStream.sample_rate),
            channels: audioStream.channels
          });
        }
      });
    });
  }

  async convertAudioToMulaw(inputBuffer, format) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-f', format.codec,
        '-ar', format.sample_rate.toString(),
        '-ac', format.channels.toString(),
        '-i', 'pipe:0',
        '-acodec', 'pcm_mulaw',
        '-ar', '8000',
        '-ac', '1',
        '-f', 'mulaw',
        'pipe:1'
      ]);

      ffmpeg.stdin.write(inputBuffer);
      ffmpeg.stdin.end();

      const chunks = [];
      ffmpeg.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      ffmpeg.stdout.on('end', () => {
        console.log('Audio conversion completed');
        resolve(Buffer.concat(chunks));
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error('FFmpeg error:', data.toString());
      });

      ffmpeg.on('error', (error) => {
        console.error('FFmpeg process error:', error);
        reject(error);
      });
    });
  }

  /* transcodeAudio(inputBuffer) {
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
        console.log('Audio transcoding completed');
        resolve(Buffer.concat(chunks));
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error('FFmpeg error:', data.toString());
      });

      ffmpeg.on('error', (error) => {
        console.error('FFmpeg process error:', error);
        reject(error);
      });
    });
  } */

    sendAudioToTwilio(audioBuffer) {
      return new Promise((resolve, reject) => {
        const chunkSize = 160; // 20ms of 8kHz mu-law audio
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
          setTimeout(sendChunk, 20); // Send every 20ms
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