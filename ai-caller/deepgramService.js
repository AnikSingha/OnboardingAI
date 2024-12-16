const axios = require('axios');
const { LiveTranscriptionEvents, createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const { checkAvailability, nextTime, createAppointment, connectToMongoDB, addLead, leadExists } = require('../auth-service/db.js');
const { 
  parse, 
  format, 
  isValid, 
  setHours, 
  setMinutes,
  addDays,
  nextDay,
  isFuture,
  startOfDay
} = require('date-fns');
const { formatInTimeZone } = require('date-fns-tz');

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
  description: "Extract a person's name when they introduce themselves. Be very lenient and accept any name-like response, even single words or nicknames.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The extracted name from the conversation. Accept any reasonable response as a name."
      },
      confidence: {
        type: "boolean",
        description: "Whether the input could reasonably be a name. Only set to false if the input is clearly not a name (like 'yes', 'no', or numbers)."
      }
    },
    required: ["name", "confidence"]
  }
};

const appointmentTimeExtractionFunction = {
  name: "extractAppointmentTime",
  description: `Extract appointment details from natural language conversation.
  Current date and time is ${new Date().toLocaleString()}.
  
  CRITICAL: You must ALWAYS parse any date/time mention into proper format.
  
  EXAMPLES:
  "this friday at three pm" → {
    appointmentTime: "2024-12-20T15:00:00",
    specifiedTime: "3 PM",
    needsMoreInfo: false,
    confidence: true
  }
  
  "friday at 3" → {
    appointmentTime: "2024-12-20T15:00:00",
    specifiedTime: "3 PM",
    needsMoreInfo: false,
    confidence: true
  }
  
  "tomorrow afternoon" → {
    appointmentTime: null,
    specifiedTime: null,
    needsMoreInfo: true,
    confidence: false
  }
  
  REQUIREMENTS:
  - Convert all number words to digits (three → 3)
  - Always include AM/PM in specifiedTime
  - Return full ISO date string for appointmentTime
  - Set needsMoreInfo true only if time is ambiguous`,
  parameters: {
    type: "object",
    properties: {
      appointmentTime: {
        type: "string",
        description: "Full ISO date-time string (YYYY-MM-DDTHH:mm:ss)"
      },
      specifiedTime: {
        type: "string",
        description: "Exact time specified by user (e.g., '3 PM')"
      },
      needsMoreInfo: {
        type: "boolean",
        description: "True if time/date is unclear"
      },
      confidence: {
        type: "boolean",
        description: "True if both day and time are clearly specified"
      }
    },
    required: ["appointmentTime", "specifiedTime", "needsMoreInfo", "confidence"]
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

// Define office timezone and operating hours
const OFFICE_TIMEZONE = process.env.TIMEZONE || 'America/New_York';
const OFFICE_HOURS = {
  start: 9, // 9 AM
  end: 17   // 5 PM
};

// Helper function to get next valid date for a day of week
const getNextValidDate = (dayName, referenceDate = new Date()) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());
  if (targetDay === -1) return null;

  let date = new Date(formatInTimeZone(referenceDate, OFFICE_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
  date = startOfDay(date);

  while (date.getDay() !== targetDay || !isFuture(date)) {
    date = addDays(date, 1);
  }

  return date;
};

// Helper function to parse and validate time
const parseTimeString = (timeStr) => {
  const normalized = timeStr.toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/([ap])\.?m\.?/i, '$1m');

  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)/i);
  if (!match) return null;

  let [_, hours, minutes = '00', meridiem] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  // Validate hours and minutes
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  // Convert to 24-hour format
  if (meridiem.toLowerCase() === 'pm' && hours !== 12) hours += 12;
  if (meridiem.toLowerCase() === 'am' && hours === 12) hours = 0;

  // Validate against office hours
  if (hours < OFFICE_HOURS.start || hours >= OFFICE_HOURS.end) return null;

  return { hours, minutes };
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

    if (transcript?.trim()) {
      conversationHistory.push({ role: 'user', content: transcript.trim() });
    }

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
          aiResponse = "I'm sorry, I didn't catch your name. Could you please say it again clearly?";
        }
      }

      if (message.function_call.name === "extractAppointmentTime") {
        try {
          console.log('Raw appointment request:', args);

          if (args.needsMoreInfo) {
            aiResponse = "What specific day and time would you prefer for your appointment?";
            return { response: aiResponse, extractedName: null };
          }

          let appointmentDate;
          if (args.appointmentTime.includes('T')) {
            // It's an ISO string
            appointmentDate = new Date(args.appointmentTime);
          } else {
            // Handle natural language parsing
            const dayMatch = args.appointmentTime.match(/(this|next)?\s*(\w+day)/i);
            const timeMatch = args.specifiedTime.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)/i);
            
            if (!dayMatch || !timeMatch) {
              throw new Error('Invalid date/time format');
            }

            let [_, prefix, day] = dayMatch;
            let [__, hours, minutes = '00', meridiem] = timeMatch;
            
            hours = parseInt(hours);
            minutes = parseInt(minutes);

            // Convert to 24-hour format
            if (meridiem.toLowerCase() === 'pm' && hours !== 12) hours += 12;
            if (meridiem.toLowerCase() === 'am' && hours === 12) hours = 0;

            // Get the next occurrence of the specified day
            const today = new Date();
            const daysOfWeek = {
              sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
              thursday: 4, friday: 5, saturday: 6
            };

            const targetDay = daysOfWeek[day.toLowerCase()];
            let targetDate = new Date(formatInTimeZone(today, OFFICE_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));

            // Calculate days to add
            while (targetDate.getDay() !== targetDay || !isFuture(targetDate)) {
              targetDate = addDays(targetDate, 1);
            }

            // Set the time
            appointmentDate = setMinutes(setHours(targetDate, hours), minutes);
          }

          if (!isValid(appointmentDate)) {
            throw new Error('Invalid date');
          }

          console.log('Appointment processing:', {
            original: args,
            parsedDate: formatInTimeZone(appointmentDate, OFFICE_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
            finalTime: formatInTimeZone(appointmentDate, OFFICE_TIMEZONE, 'h:mm a'),
            finalDate: formatInTimeZone(appointmentDate, OFFICE_TIMEZONE, 'EEEE, MMMM d')
          });

          if (!isFuture(appointmentDate)) {
            aiResponse = "That time has already passed. Would you like to schedule for next week instead?";
            return { response: aiResponse, extractedName: null };
          }

          const formattedAppointmentDate = formatInTimeZone(appointmentDate, OFFICE_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
          const isAvailable = await checkAvailability(formattedAppointmentDate);
          
          if (isAvailable) {
            const scheduled = await createAppointment(currentName, phoneNumber, formattedAppointmentDate);
            
            if (scheduled && !await leadExists(phoneNumber)) {
              await addLead(phoneNumber, currentName);
            }
            
            aiResponse = scheduled 
              ? `Perfect! I've scheduled your appointment for ${formatInTimeZone(
                  appointmentDate,
                  OFFICE_TIMEZONE,
                  'EEEE, MMMM d, yyyy \'at\' h:mm a zzz'
                )}. We look forward to seeing you!`
              : `I apologize, but there was an error scheduling your appointment. Please try again or call our office directly.`;
          } else {
            const nextAvailableTime = await nextTime(formattedAppointmentDate);
            if (nextAvailableTime) {
              aiResponse = `I apologize, but that time isn't available. The next available time is ${formatInTimeZone(
                nextAvailableTime,
                OFFICE_TIMEZONE,
                'EEEE, MMMM d, yyyy \'at\' h:mm a zzz'
              )}. Would that work for you?`;
            } else {
              aiResponse = `I apologize, but that time isn't available. Could you please suggest another time?`;
            }
          }
        } catch (error) {
          console.error('Error processing appointment:', error);
          aiResponse = "I apologize, but I couldn't understand the appointment time. Could you please specify the day and time again? For example, 'Wednesday at 2 PM' or 'next Friday at 2:30 PM'";
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
    
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return {
        response: "I apologize, but I'm experiencing technical difficulties at the moment. Please try again later or contact support for assistance.",
        extractedName: null
      };
    }

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
