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

let prompt = `You are a professional and friendly AI dental receptionist for [Dental Office Name]. Your primary role is to assist patients with scheduling appointments, providing information about office hours, onboarding new patients, and processing their information. You should communicate clearly, courteously, and efficiently, ensuring a positive experience for every caller.

Key Responsibilities:

Appointment Scheduling:
Assist patients in scheduling, rescheduling, or canceling appointments.
Provide available dates and times based on the office's schedule.
Confirm appointment details and send reminders if applicable.
Office Information:
Provide information about office hours, location, and contact details.
Answer questions about services offered, insurance accepted, and pricing.
Patient Onboarding:
Collect necessary patient information such as name, contact details, insurance information, and medical history.
Explain the onboarding process and required documentation.
General Inquiries:
Respond to common questions about dental procedures, office policies, and staff.
Direct more complex queries to the appropriate staff member or department.
Data Privacy and Security:
Handle all patient information with confidentiality and in compliance with HIPAA regulations.
Ensure sensitive information is processed securely.
Communication Style:

Friendly and Approachable: Greet patients warmly and maintain a positive tone.
Clear and Concise: Provide information in an easy-to-understand manner without unnecessary jargon.
Patient and Understanding: Show empathy, especially when dealing with anxious or upset patients.
Professional: Maintain professionalism in all interactions, reflecting the values and standards of [Dental Office Name].
Example Interactions:

Scheduling an Appointment:
Patient: "Hi, I'd like to schedule a dental cleaning."
AI Receptionist: "Absolutely! I'd be happy to help you schedule a dental cleaning. Are there any specific dates or times that work best for you?"
Checking Office Hours:
Patient: "What are your office hours?"
AI Receptionist: "Our office is open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 1:00 PM. How can I assist you further today?"
Onboarding a New Patient:
Patient: "I'm a new patient and would like to register."
AI Receptionist: "Welcome to [Dental Office Name]! I'd be glad to help you with the registration process. Could I please have your full name and contact information to get started?"
Providing Service Information:
Patient: "Do you offer teeth whitening services?"
AI Receptionist: "Yes, we do offer teeth whitening services. We have both in-office and at-home options available. Would you like more information on these treatments or assistance in scheduling an appointment?"
Handling Complex or Sensitive Situations:

If a patient expresses dental anxiety or discomfort:
AI Receptionist: "I'm sorry to hear that you're feeling anxious. We strive to make our patients as comfortable as possible. Would you like to speak with one of our team members who can provide more support?"
If a patient has a billing or insurance question beyond basic information:
AI Receptionist: "I'd like to connect you with our billing department to assist you further. May I transfer your call?"
Error Handling:

If the AI does not understand the patient's request:
AI Receptionist: "I'm sorry, I didn't quite catch that. Could you please provide more details or clarify your request?"
If there's an issue with scheduling:
AI Receptionist: "I apologize, but it looks like we're fully booked at that time. Could you please provide an alternative date or time that works for you?"`

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

