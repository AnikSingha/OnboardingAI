const axios = require('axios');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const prompt = `You are a professional and friendly AI dental receptionist for [Dental Office Name]. Your primary role is to:

- Assist patients with scheduling appointments: Provide available dates and times, and help with rescheduling or canceling appointments.
- Provide office information: Share details about office hours, location, contact information, services offered, insurance accepted, and pricing.
- Onboard new patients: Collect necessary information such as name and contact details, and explain the onboarding process.
- Respond to general inquiries: Answer questions about dental procedures, office policies, and staff. Direct complex queries to the appropriate team member.
- Handle patient information with confidentiality: Comply with HIPAA regulations and ensure all sensitive information is processed securely.

Communication Style:

- Friendly and Approachable: Greet patients warmly with a positive tone.
- Clear and Concise: Provide easy-to-understand information without unnecessary jargon.
- Patient and Understanding: Show empathy, especially with anxious or upset patients.
- Professional: Reflect the values and standards of [Dental Office Name] in all interactions.`;


// Add cache configuration
const CACHE_CONFIG = {
  MAX_SIZE: 1000,  // Maximum number of items in cache
  TTL: 1000 * 60 * 60, // Cache TTL: 1 hour
  MAX_HISTORY: 10
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
    model: 'nova-2-conversationalai',
    interim_results: true,
    endpointing: 200,
    utterance_end_ms: 1000
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

// Add conversation context cache
const conversationCache = new Map();

// Add name extraction function definition
const nameExtractionFunction = {
  name: "extractName",
  description: "Extract a person's name when they introduce themselves",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The extracted name from the conversation"
      },
      confidence: {
        type: "boolean",
        description: "Whether the name was confidently extracted"
      }
    },
    required: ["name", "confidence"]
  }
};

const processTranscript = async (transcript, sessionId, currentName = null) => {
  if (!transcript?.trim()) {
    console.log('Received empty transcript.');
    return {
      response: 'I did not catch that. Could you please repeat?',
      extractedName: null
    };
  }

  try {
    // Get or initialize conversation history
    let conversationHistory = conversationCache.get(sessionId) || [];
    
    // Add user's message to history
    const userMessage = { 
      role: 'user', 
      content: transcript.toString().trim() 
    };
    conversationHistory.push(userMessage);

    // Prepare messages array with system prompt and conversation history
    const messages = [
      { 
        role: 'system', 
        content: !currentName 
          ? `${prompt}\nIMPORTANT: We don't have the caller's name yet. Please ask for their name if they haven't provided it.`
          : prompt
      },
      ...conversationHistory.filter(msg => msg.content != null)
    ];

    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        functions: [nameExtractionFunction],
        function_call: currentName ? 'none' : 'auto'
      }),
      10000,
      'OpenAI API request timed out'
    );

    const message = response.choices[0].message;
    let aiResponse = message.content;
    let extractedName = null;

    // Handle name extraction if applicable
    if (message.function_call) {
      try {
        const args = JSON.parse(message.function_call.arguments);
        if (args.confidence) {
          extractedName = args.name.trim();
          // Generate a greeting response when name is extracted
          aiResponse = `Nice to meet you, ${extractedName}! How can I assist you today?`;
        }
      } catch (error) {
        console.error('Error parsing function call arguments:', error);
      }
    }

    // Ensure we have a response
    if (!aiResponse) {
      aiResponse = message.content || 'How can I assist you today?';
    }

    // Update conversation history with AI's response
    conversationHistory.push({ 
      role: 'assistant', 
      content: aiResponse 
    });
    
    // Maintain max history size
    if (conversationHistory.length > CACHE_CONFIG.MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-CACHE_CONFIG.MAX_HISTORY);
    }
    
    // Update cache
    conversationCache.set(sessionId, conversationHistory);
    manageCache(conversationCache);

    return {
      response: aiResponse,
      extractedName: extractedName
    };

  } catch (error) {
    console.error(
      'Error in processTranscript:',
      error.response ? error.response.data : error.message
    );
    
    return {
      response: 'Sorry, I am unable to process your request at the moment.',
      extractedName: null
    };
  }
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram
};

