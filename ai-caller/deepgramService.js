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

const initializeDeepgram = ({ onOpen, onTranscript, onError, onClose, onUtteranceEnd }) => {
  const dgLive = deepgram.listen.live({
    encoding: 'mulaw',
    sample_rate: 8000,
    punctuate: true,
    interim_results: true,
    endpointing: 3000,
    utterance_end_ms: 5000,
  });

  dgLive.on(LiveTranscriptionEvents.Open, onOpen);

  dgLive.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
    try {
      console.log('Raw transcription:', transcription);
      
      const transcript = transcription.channel.alternatives[0].transcript.trim();
      
      // Handle speech_final to mark end of speech segments
      if (transcription.speech_final) {
        console.log('Speech final detected - ending current segment');
        await onTranscript(transcript, true); // true indicates end of speech
        return;
      }
      
      // Only process final transcripts that have content
      if (transcription.is_final && transcript) {
        console.log('Final transcript:', transcript);
        await onTranscript(transcript, false);
      }

    } catch (error) {
      console.error('Error in transcript handling:', error);
    }
  });

  dgLive.on('UtteranceEnd', (data) => {
    if (onUtteranceEnd) {
      onUtteranceEnd(data.last_word_end);
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
    return null;
  }

  try {
    if (isNameExtraction) {
      const functions = [{
        name: "extractName",
        description: "Extract a person's name from conversation, including greetings like 'Hi, I'm [name]' or 'My name is [name]'",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The extracted name from the conversation"
            },
            confidence: {
              type: "number",
              description: "Confidence score between 0 and 1 that this is actually a name"
            }
          },
          required: ["name", "confidence"]
        }
      }];

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI assistant making a phone call. Extract names when mentioned in conversation, even from partial sentences."
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
        const result = JSON.parse(message.function_call.arguments);
        if (result.confidence > 0.7 && result.name.trim().length > 1) {
          return result.name.trim();
        }
        console.log('Name extraction skipped - confidence:', result.confidence);
        return null;
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
    return null;
  }
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram
};