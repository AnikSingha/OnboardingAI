const axios = require('axios');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Shortened prompt for efficiency
const prompt = `You are a professional and friendly AI dental receptionist for [Dental Office Name]. Assist patients with scheduling appointments, providing office information, onboarding new patients, and processing their information. Communicate clearly and courteously, ensuring a positive experience. Handle patient information with confidentiality and comply with HIPAA regulations.`;

// Caches for TTS audio and AI responses
const ttsCache = {};
const responseCache = new Map();

// Utility function to implement timeouts for asynchronous operations
const withTimeout = (promise, timeoutMs, errorMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutId);
    return result;
  });
};

// Initialize Deepgram live transcription with event handlers
const initializeDeepgram = ({ onOpen, onTranscript, onError, onClose }) => {
  const dgLive = deepgram.transcription.live({
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

// Generate TTS audio with caching to reduce latency
const getCachedTTS = async (text) => {
  if (!text || text.trim() === '') {
    throw new Error('Text for TTS cannot be null or empty');
  }

  // Return cached audio if available
  if (ttsCache[text]) {
    return ttsCache[text];
  }

  try {
    const ttsResponse = await withTimeout(
      axios.post(
        'https://api.deepgram.com/v1/speak',
        { text },
        {
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'audio/mulaw',
          },
          params: {
            model: 'aura-luna-en',
            encoding: 'mulaw',
            container: 'none',
            sample_rate: 8000,
          },
          responseType: 'arraybuffer',
        }
      ),
      5000, // Timeout in milliseconds
      'TTS generation timed out'
    );

    if (ttsResponse.status !== 200) {
      throw new Error(`TTS generation failed with status ${ttsResponse.status}`);
    }

    const audioBuffer = Buffer.from(ttsResponse.data);
    ttsCache[text] = audioBuffer; // Cache the generated audio
    return audioBuffer;
  } catch (error) {
    console.error('Error in generateTTS:', error.message || error);
    throw error;
  }
};

// Process user transcripts with caching and optimizations
const processTranscript = async (transcript, isNameExtraction = false) => {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  // Check if the transcript appears complete
  if (!transcript.endsWith('.') && transcript.length < 20) {
    console.log('Transcript appears incomplete. Waiting for more input.');
    return null;
  }

  try {
    // Use cache to avoid redundant API calls
    const cacheKey = `${isNameExtraction}-${transcript}`;
    if (responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey);
    }

    if (isNameExtraction) {
      // Proceed with name extraction if indicators are present
      const nameIndicators = ['my name is', 'this is', "i'm", 'i am', 'call me'];
      const lowerTranscript = transcript.toLowerCase();

      if (!nameIndicators.some((indicator) => lowerTranscript.includes(indicator))) {
        console.log('Transcript does not contain name indicators.');
        return null;
      }

      const functions = [
        {
          name: 'extractName',
          description: "Extract a person's name from conversation",
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The extracted name from the conversation',
              },
            },
            required: ['name'],
          },
        },
      ];

      const response = await withTimeout(
        openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: transcript },
          ],
          functions,
          function_call: 'auto',
        }),
        5000, // Timeout in milliseconds
        'OpenAI API request timed out'
      );

      const message = response.choices[0].message;

      if (message.function_call) {
        const args = JSON.parse(message.function_call.arguments);
        const extractedName = args.name;

        // Validate and cache the extracted name
        if (typeof extractedName === 'string' && extractedName.trim().length > 1) {
          const name = extractedName.trim();
          responseCache.set(cacheKey, name);
          return name;
        } else {
          console.log('Invalid name extracted:', extractedName);
          return null;
        }
      }
      return null;
    } else {
      // General response processing
      const response = await withTimeout(
        openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: transcript },
          ],
        }),
        5000, // Timeout in milliseconds
        'OpenAI API request timed out'
      );

      const aiResponse = response.choices[0].message.content;
      responseCache.set(cacheKey, aiResponse); // Cache the AI response
      return aiResponse;
    }
  } catch (error) {
    console.error(
      'Error in processTranscript:',
      error.response ? error.response.data : error.message
    );
    return 'Sorry, I am unable to process your request at the moment.';
  }
};

module.exports = {
  getCachedTTS,
  processTranscript,
  initializeDeepgram,
};
