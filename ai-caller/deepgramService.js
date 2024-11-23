const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
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
    model: 'nova-2-phonecall',
    punctuate: true,
    interim_results: true,
    endpointing: 500,
    utterance_end_ms: 2000,
  });

  dgLive.on(LiveTranscriptionEvents.Open, () => {
    console.log('Deepgram connection established');
    onOpen();
    // processQueue();
  });

  dgLive.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
    try {
      await onTranscript(transcription);
    } catch (error) {
      console.error('Error in Deepgram transcript handler:', error);
      onError(error);
    }
  });

  dgLive.on(LiveTranscriptionEvents.Error, (error) => {
    console.error('Deepgram connection error:', error);
    onError(error);
  });

  dgLive.on(LiveTranscriptionEvents.Close, () => {
    console.log('Deepgram connection closed');
    onClose();
  });

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
          model:'aura-luna-en',
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

const processTranscript = async (transcript, isNameExtraction = false) => {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  try {
    if (isNameExtraction) {
      // Check if the transcript is likely complete
      if (!transcript.endsWith('.') && transcript.length < 5) { // Adjust conditions as needed
        console.log('Transcript too short or incomplete for name extraction.');
        return null;
      }

      const functions = [{
        name: "extractName",
        description: "Extract a person's name from conversation",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The extracted name from the conversation"
            }
          },
          required: ["name"]
        }
      }];

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI assistant making a phone call. Extract names when mentioned in conversation."
          },
          {
            role: "user", 
            content: transcript
          }
        ],
        functions,
        function_call: "auto"
      });

      const message = response.choices[0].message;
      
      if (message.function_call) {
        const extractedName = JSON.parse(message.function_call.arguments).name;
        // Validate the extracted name
        if (typeof extractedName === 'string' && extractedName.trim().length > 1) {
          return extractedName.trim();
        } else {
          console.log('Invalid name extracted:', extractedName);
          return null;
        }
      }
      return null;
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI assistant making a phone call. Keep responses concise and natural."
          },
          {
            role: "user", 
            content: transcript
          }
        ]
      });
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram
};