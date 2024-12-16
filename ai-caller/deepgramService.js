const axios = require('axios');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const { checkAvailability, nextTime, createAppointment, connectToMongoDB, addLead, leadExists } = require('../auth-service/db.js');

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('Environment check:', {
  hasDeepgram: !!process.env.DEEPGRAM_API_KEY,
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  envPath: path.join(__dirname, '..', '.env')
});

// Verify Deepgram API key exists
if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
}

// Then initialize services
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Verify OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompt = `You are a professional and friendly AI dental receptionist for [Dental Office Name]. Your primary role is to:

- Assist patients with scheduling appointments
- When a patient mentions a relative date/time (like "tomorrow" or "next Monday"), convert it to an actual date
- Always use the current year for appointments unless explicitly specified otherwise
- If a requested time is not available, immediately suggest the next available time
- Handle date/time clarification naturally, asking follow-up questions when needed
- Provide office information when requested

Communication Style:
- Proactive: When someone mentions booking/scheduling, immediately help guide them through the process
- Clear and Specific: Ask for date and time separately if needed
- Helpful: Always suggest alternatives if requested times are unavailable
- Natural: Handle relative dates (tomorrow, next week, etc.) appropriately`;

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
        description: "The extracted appointment time in ISO 8601 format. For relative dates like 'tomorrow' or 'next week', calculate the actual date based on current time. Example: If user says 'tomorrow at 3pm', convert to full ISO date."
      },
      hasSchedulingIntent: {
        type: "boolean",
        description: "Whether the user is trying to schedule an appointment"
      },
      needsMoreInfo: {
        type: "boolean",
        description: "Whether we need to ask for more specific date/time information"
      },
      confidence: {
        type: "boolean",
        description: "Whether the time was confidently extracted"
      },
      isRelativeDate: {
        type: "boolean",
        description: "Whether the date mentioned was relative (like 'tomorrow', 'next week')"
      }
    },
    required: ["appointmentTime", "hasSchedulingIntent", "needsMoreInfo", "confidence", "isRelativeDate"]
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
  try {
    // First check if we have the caller's info in leads collection
    if (!currentName && phoneNumber) {
      const db = await getDb();
      const leadsCollection = db.collection('leads');
      const existingLead = await leadsCollection.findOne({ _number: phoneNumber });
      
      if (existingLead?.name) {
        currentName = existingLead.name;
        // Update conversation history with personalized greeting
        const initialResponse = {
          response: `Hello ${currentName}! How can I assist you today?`,
          extractedName: currentName
        };
        conversationCache.set(sessionId, [
          { role: 'assistant', content: initialResponse.response }
        ]);
        return initialResponse;
      }
    }

    // Get or initialize conversation history
    let conversationHistory = conversationCache.get(sessionId) || [];
    const isFirstInteraction = conversationHistory.length === 0;

    if (isFirstInteraction && !transcript) {
      const initialResponse = {
        response: "Hello! May I know your name, please?",
        extractedName: null
      };
      conversationHistory.push({ role: 'assistant', content: initialResponse.response });
      conversationCache.set(sessionId, conversationHistory);
      return initialResponse;
    }

    // Only add valid transcripts to conversation history
    if (transcript?.trim()) {
      conversationHistory.push({ role: 'user', content: transcript.trim() });
    }

    // Filter out any messages with null content
    conversationHistory = conversationHistory.filter(msg => msg.content != null);

    const messages = [
      { 
        role: 'system', 
        content: !currentName 
          ? `${prompt}\nIMPORTANT: The caller is responding to your question about their name. Extract their name and respond warmly.`
          : prompt
      },
      ...conversationHistory
    ];

    console.log('Sending messages to OpenAI:', JSON.stringify(messages, null, 2));

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      functions: [nameExtractionFunction, appointmentTimeExtractionFunction, scheduleAppointmentFunction],
      function_call: !currentName ? { name: 'extractName' } : 'auto'
    });

    const message = response.choices[0].message;
    let aiResponse = message.content;
    let extractedName = null;

    if (message.function_call) {
      const args = JSON.parse(message.function_call.arguments);
      
      if (message.function_call.name === "extractName") {
        if (args.confidence) {
          extractedName = args.name.trim();
          aiResponse = `Nice to meet you, ${extractedName}! How can I assist you today?`;
        } else {
          aiResponse = "I'm sorry, I didn't catch your name. Could you please repeat it?";
        }
      }

      if (message.function_call.name === "extractAppointmentTime" && args.hasSchedulingIntent) {
        if (args.needsMoreInfo) {
          aiResponse = "What day would you prefer for your appointment? And what time works best for you?";
        } else if (args.confidence && args.appointmentTime) {
          let appointmentDate;
          try {
            appointmentDate = new Date(args.appointmentTime);
            
            // Validate the date is valid
            if (isNaN(appointmentDate.getTime())) {
              throw new Error('Invalid date');
            }

            // If it's a relative date (tomorrow, next week, etc.), ensure it's properly set
            if (args.isRelativeDate) {
              // Ensure the date is in the future
              if (appointmentDate < new Date()) {
                appointmentDate.setDate(appointmentDate.getDate() + 1);
              }
            }

            // Ensure we're using current year if not specified
            if (appointmentDate.getFullYear() < new Date().getFullYear()) {
              appointmentDate.setFullYear(new Date().getFullYear());
            }

            const isAvailable = await checkAvailability(appointmentDate);
            
            if (isAvailable) {
              const scheduled = await createAppointment(currentName, phoneNumber, appointmentDate);
              
              // If we have a new patient, add them to leads
              if (scheduled && !await leadExists(phoneNumber)) {
                await addLead(phoneNumber, currentName);
              }
              
              aiResponse = scheduled 
                ? `Perfect! I've scheduled your appointment for ${appointmentDate.toLocaleString()}. We look forward to seeing you!`
                : `I apologize, but there was an error scheduling your appointment. Please try again or call our office directly.`;
            } else {
              const nextAvailableTime = await nextTime(appointmentDate);
              aiResponse = nextAvailableTime 
                ? `I apologize, but that time isn't available. The next available time is ${new Date(nextAvailableTime).toLocaleString()}. Would that work for you?`
                : `I apologize, but that time isn't available. Could you please suggest another time?`;
            }
          } catch (error) {
            console.error('Error processing appointment date:', error);
            aiResponse = "I apologize, but I couldn't understand the appointment time. Could you please specify the date and time again?";
          }
        }
      }
    }

    conversationHistory.push({ role: 'assistant', content: aiResponse });
    
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
    
    // Handle rate limit and quota errors specifically
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return {
        response: "I apologize, but I'm experiencing technical difficulties at the moment. Please try again later or contact support for assistance.",
        extractedName: null
      };
    }

    // Handle other errors
    return {
      response: 'I apologize, but I am having trouble understanding. Could you please rephrase that?',
      extractedName: null
    };
  }
};

const cleanupSession = (sessionId) => {
  conversationCache.delete(sessionId);
  ttsCache.delete(sessionId);
  responseCache.delete(sessionId);
};

module.exports = {
  generateTTS,
  processTranscript,
  initializeDeepgram,
  cleanupSession
};
