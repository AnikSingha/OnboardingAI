import 'dotenv/config';
import express from 'express';
import twilio from 'twilio';
import { createClient } from '@deepgram/sdk';
import axios from 'axios';
import OpenAI from 'openai';
import { MongoClient } from 'mongodb';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(client => {
  db = client.db('callData');
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

const twilioClient = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

let initialGreetingUrl;

async function generateInitialGreeting() {
  const greetingText = "Hey, how can I help you today?";
  const ttsResponse = await axios.post(
    'https://api.deepgram.com/v1/speak',
    {
      text: greetingText,
    },
    {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg', // Request MP3 format
      },
      responseType: 'arraybuffer',
    }
  );

  if (ttsResponse.status !== 200) {
    throw new Error('Failed to generate TTS for initial greeting');
  }

  const ttsAudioBuffer = Buffer.from(ttsResponse.data, 'binary');

  // Save the TTS audio to a file
  const audioFileName = `greeting.mp3`;
  const audioFilePath = path.join(__dirname, 'public', 'audio', audioFileName);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(audioFilePath), { recursive: true });

  fs.writeFileSync(audioFilePath, ttsAudioBuffer);

  initialGreetingUrl = `${process.env.NGROK_URL}/audio/${audioFileName}`;
}


generateInitialGreeting().catch(error => {
  console.error('Error generating initial greeting:', error);
});


app.post('/inbound-call', async (req, res) => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();


    twiml.play(initialGreetingUrl);


    twiml.record({
      action: `${process.env.NGROK_URL}/handle-recording`,
      recordingStatusCallbackEvent: 'completed',
      timeout: 5,
      transcribe: false,
    });

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error in /inbound-call:', error);
    res.status(500).send('An error occurred');
  }
});


app.post('/handle-recording', async (req, res) => {
  const recordingUrl = req.body.RecordingUrl || req.query.RecordingUrl;
  if (!recordingUrl) {
    console.error('Recording URL not provided');
    return res.status(400).send('Recording URL not provided');
  }
  const fromNumber = req.body.From || '+18663527701';
  try {

    console.log('Recording URL:', recordingUrl);
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);


    await new Promise(resolve => setTimeout(resolve, 5000));


    const recordingResponse = await axios.get(`${recordingUrl}.wav`, {
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
      responseType: 'arraybuffer',
    });

    if (recordingResponse.status !== 200) {
      throw new Error('Failed to download the recording');
    }


    const audioBuffer = Buffer.from(recordingResponse.data, 'binary');
    const recordingRecord = {
      recordingUrl,
      fromNumber,
      audioBuffer,
      timestamp: new Date(),
    };
    await db.collection('recordings').insertOne(recordingRecord);


    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        punctuate: true,
      }
    );

    if (error) {
      throw new Error(`Transcription failed: ${error}`);
    }

    const transcription = result.results.channels[0].alternatives[0].transcript;

    if (!transcription) {
      throw new Error('Transcription failed or returned empty result.');
    }

    console.log('Transcription:', transcription);


    if (transcription.toLowerCase().includes('goodbye')) {
      // End the call gracefully
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Goodbye!');
      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }


    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: transcription }],
      max_tokens: 100,
    });

    const gptText = gptResponse.choices[0].message.content.trim();

    console.log('GPT Response:', gptText);


    const ttsResponse = await axios.post(
      'https://api.deepgram.com/v1/speak',
      {
        text: gptText,
      },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg', // Request MP3 format
        },
        responseType: 'arraybuffer',
      }
    );

    if (ttsResponse.status !== 200) {
      throw new Error('Failed to generate TTS from Deepgram');
    }

    const ttsAudioBuffer = Buffer.from(ttsResponse.data, 'binary');


    const audioFileName = `response_${Date.now()}.mp3`;
    const audioFilePath = path.join(__dirname, 'public', 'audio', audioFileName);


    fs.mkdirSync(path.dirname(audioFilePath), { recursive: true });

    fs.writeFileSync(audioFilePath, ttsAudioBuffer);


    const audioRecord = {
      responseText: gptText,
      timestamp: new Date(),
    };
    await db.collection('audioResponses').insertOne(audioRecord);

    const playbackUrl = `${process.env.NGROK_URL}/audio/${audioFileName}`;

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.play(playbackUrl);


    twiml.record({
      action: `${process.env.NGROK_URL}/handle-recording`,
      recordingStatusCallbackEvent: 'completed',
      timeout: 5,
      transcribe: false,
    });

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
