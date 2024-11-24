const axios = require('axios');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


let prompt = `
You are a professional and friendly AI dental receptionist for [Dental Office Name]. Your primary role is to:
Assist patients with scheduling appointments: Provide available dates and times, and help with rescheduling or canceling appointments.
Provide office information: Share details about office hours, location, contact information, services offered, insurance accepted, and pricing.
Onboard new patients: Collect necessary information such as name and contact details, and explain the onboarding process.
Respond to general inquiries: Answer questions about dental procedures, office policies, and staff. Direct complex queries to the appropriate team member.
Handle patient information with confidentiality: Comply with HIPAA regulations and ensure all sensitive information is processed securely.
Communication Style:
Friendly and Approachable: Greet patients warmly with a positive tone.
Clear and Concise: Provide easy-to-understand information without unnecessary jargon.
Patient and Understanding: Show empathy, especially with anxious or upset patients.
Professional: Reflect the values and standards of [Dental Office Name] in all interactions.
Example Interaction:
Patient: "Hi, I'd like to schedule a dental cleaning."
AI Receptionist: "Absolutely! I'd be happy to help you schedule that. Do you have any preferred dates or times?"`

// Add cache configuration
const CACHE_CONFIG = {
  MAX_SIZE: 1000,  // Maximum number of items in cache
  TTL: 1000 * 60 * 60, // Cache TTL: 1 hour
}

// Replace simple caches with more structured ones
const ttsCache = new Map();
const responseCache = new Map();

// Add cache management utility
const manageCache = (cache) => {
  if (cache.size > CACHE_CONFIG.MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

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
  if (!text?.trim()) {
    throw new Error('Text for TTS cannot be null or empty');
  }

  // Check cache with timestamp validation
  const cached = ttsCache.get(text);
  if (cached && (Date.now() - cached.timestamp) < CACHE_CONFIG.TTL) {
    return cached.data;
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

    const audioBuffer = Buffer.from(ttsResponse.data);
    
    // Store with timestamp
    ttsCache.set(text, {
      data: audioBuffer,
      timestamp: Date.now()
    });
    manageCache(ttsCache);
    
    return audioBuffer;
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

  if (!transcript.endsWith('.') && transcript.length < 20) {
    console.log('Transcript appears incomplete. Waiting for more input.');
    return null;
  }

  try {
    const cacheKey = `${isNameExtraction}-${transcript}`;
    
    // Check cache with timestamp validation
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_CONFIG.TTL) {
      return cached.data;
    }

    if (isNameExtraction) {
      // Proceed with name extraction if indicators are present
      const nameIndicators = ['my name is', 'this is', "i'm", 'i am', 'call me'];
      const lowerTranscript = transcript.toLowerCase();

      if (!nameIndicators.some((indicator) => lowerTranscript.includes(indicator))) {
        console.log('Transcript does not contain name indicators.');
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
            content: prompt
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
      
      // Update cache storage
      responseCache.set(cacheKey, {
        data: aiResponse,
        timestamp: Date.now()
      });
      manageCache(responseCache);

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
  generateTTS,
  processTranscript,
  initializeDeepgram
};

