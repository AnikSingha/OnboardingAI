const axios = require('axios');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Then use them
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const { checkAvailability, nextTime, createAppointment, connectToMongoDB } = require('../auth-service/db.js');

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

// Cache configuration
const CACHE_CONFIG = {
  MAX_SIZE: 1000,
  TTL: 1000 * 60 * 60,
  MAX_HISTORY: 10
};

// Initialize all caches once
const ttsCache = new Map();
const responseCache = new Map();
const conversationCache = new Map();

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

const appointmentTimeExtractionFunction = {
  name: "extractAppointmentTime",
  description: "Extract appointment scheduling intent and time from the conversation",
  parameters: {
    type: "object",
    properties: {
      appointmentTime: {
        type: "string",
        description: "The extracted appointment time in ISO 8601 format"
      },
      hasSchedulingIntent: {
        type: "boolean",
        description: "Whether the user is trying to schedule an appointment"
      },
      confidence: {
        type: "boolean",
        description: "Whether the time was confidently extracted"
      }
    },
    required: ["appointmentTime", "hasSchedulingIntent", "confidence"]
  }
};

const scheduleAppointmentFunction = {
  name: "scheduleAppointment",
  description: "Schedule a dental appointment for a specific date and time",
  parameters: {
    type: "object",
    properties: {
      appointmentTime: {
        type: "string",
        description: "The requested appointment time in ISO 8601 format"
      },
      action: {
        type: "string",
        enum: ["check", "schedule", "suggest_next"],
        description: "Whether to check availability, schedule the appointment, or find next available time"
      }
    },
    required: ["appointmentTime", "action"]
  }
};

const processTranscript = async (transcript, sessionId, currentName = null, phoneNumber = null) => {
  // Get or initialize conversation history
  let conversationHistory = conversationCache.get(sessionId) || [];
  const isFirstInteraction = conversationHistory.length === 0;

  // If it's the first interaction, we need to send the initial greeting
  if (isFirstInteraction) {
    const initialResponse = {
      response: "Hello! May I know your name, please?",
      extractedName: null
    };
    conversationHistory.push({ role: 'assistant', content: initialResponse.response });
    conversationCache.set(sessionId, conversationHistory);
    return initialResponse;
  }

  if (!transcript?.trim()) {
    return {
      response: 'I did not catch that. Could you please repeat?',
      extractedName: null
    };
  }

  try {
    conversationHistory.push({ role: 'user', content: transcript.toString().trim() });

    const messages = [
      { 
        role: 'system', 
        content: !currentName 
          ? `${prompt}\nIMPORTANT: First ask for the caller's name. Only after getting their name, proceed with asking how you can help.`
          : prompt
      },
      ...conversationHistory
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      functions: [nameExtractionFunction, appointmentTimeExtractionFunction, scheduleAppointmentFunction],
      function_call: 'auto'
    });

    const message = response.choices[0].message;
    let aiResponse = message.content;
    let extractedName = null;

    if (message.function_call) {
      const args = JSON.parse(message.function_call.arguments);
      
      if (message.function_call.name === "extractName" && args.confidence) {
        extractedName = args.name.trim();
        if (!currentName) {
          aiResponse = `Nice to meet you, ${extractedName}! How can I assist you today?`;
        }
      }
      
      if (message.function_call.name === "extractAppointmentTime" && args.hasSchedulingIntent) {
        const { appointmentTime, confidence } = args;
        if (confidence && appointmentTime) {
          const isAvailable = await checkAvailability(appointmentTime);
          if (isAvailable) {
            aiResponse = `I can schedule you for ${new Date(appointmentTime).toLocaleString()}. Would you like me to book this appointment for you?`;
          } else {
            aiResponse = `I apologize, but that time isn't available. Could you please suggest another time?`;
          }
        }
      }
    }

    // If no name extracted and no current name, ensure we ask for name first
    if (!extractedName && !currentName && isFirstInteraction) {
      aiResponse = "Hello! May I know your name, please?";
    }

    // Only add response to history if it's meaningful
    if (aiResponse && !conversationHistory.some(msg => 
      msg.role === 'assistant' && 
      msg.content === aiResponse
    )) {
      conversationHistory.push({ role: 'assistant', content: aiResponse });
    }
    
    if (conversationHistory.length > CACHE_CONFIG.MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-CACHE_CONFIG.MAX_HISTORY);
    }
    conversationCache.set(sessionId, conversationHistory);

    return {
      response: aiResponse,
      extractedName
    };

  } catch (error) {
    console.error('Error in processTranscript:', error);
    return {
      response: 'I apologize, but I am having trouble understanding. Could you please rephrase that?',
      extractedName: null
    };
  }
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram
};
