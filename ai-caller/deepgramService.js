// deepgram.js
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config(); // Ensure dotenv is loaded

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate TTS audio buffer using Deepgram
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

// Function to process transcript with GPT-3
const processTranscript = async (transcript, isAskingForName = false) => {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  try {
    let response;
    if (isAskingForName) {
      response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that extracts specific information. Your job is to extract and return only the name from the given statement.',
          },
          {
            role: 'user',
            content: `Extract the name from this statement: "${transcript}"`,
          },
        ],
      });
    } else {
      response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly assistant that helps users with general inquiries.',
          },
          { role: 'user', content: transcript },
        ],
      });
    }

    const assistantResponse = response.choices[0].message.content.trim();
    return assistantResponse;
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
};

module.exports = {
  generateTTS,
  processTranscript,
};
