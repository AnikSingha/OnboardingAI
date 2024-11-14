const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const initializeDeepgram = ({ onOpen, onTranscript, onError, onClose }) => {
  const dgLive = deepgram.listen.live({
    encoding: 'mulaw',
    sample_rate: 8000,
    channels: 1,
    model: 'nova',
    punctuate: true,
    interim_results: true,
    endpointing: 200,
    utterance_end_ms: 1000,
  });

  dgLive.on(LiveTranscriptionEvents.Open, onOpen);

  dgLive.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
    if (transcription.is_final) {
      const transcript = transcription.channel.alternatives[0].transcript;
      await onTranscript(transcript);
    }
  });

  dgLive.on(LiveTranscriptionEvents.Error, onError);
  dgLive.on(LiveTranscriptionEvents.Close, onClose);

  return dgLive;
};

const generateTTS = async (text) => {
  if (!text || text.trim() === '') {
    throw new Error('Text for TTS cannot be null or empty');
  }

  try {
    const ttsResponse = await axios.post(
      'https://api.deepgram.com/v1/speak',
      { text },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'audio/mulaw',
        },
        params: {
          encoding: 'mulaw',
          container: 'none',
          sample_rate: 8000,
        },
        responseType: 'arraybuffer',
      }
    );

    if (ttsResponse.status !== 200) {
      throw new Error('TTS generation failed');
    }

    return Buffer.from(ttsResponse.data);
  } catch (error) {
    console.error('Error in generateTTS:', error);
    throw error;
  }
};

const processTranscript = async (transcript, callerName) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are a friendly AI assistant making a phone call. Keep responses brief and conversational. 
                 If you learn the caller's name, use it naturally in conversation. 
                 Your goal is to have a natural, flowing conversation.`
      },
      {
        role: 'user',
        content: `Caller said: "${transcript}"`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error in processTranscript:', error);
    throw error;
  }
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram
};