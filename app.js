require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Store conversation history for each session
const conversations = new Map();

// Define the AI assistant's role and capabilities
const systemMessage = {
  role: "system",
  content: `You are an AI assistant for a business, primarily responsible for making appointments. You should conduct the conversation as if it's a phone call, speaking naturally and conversationally. Your tasks include:
  1. Scheduling appointments for clients
  2. Checking availability in the calendar
  3. Confirming appointment details
  4. Rescheduling or canceling appointments when necessary
  5. Answering basic questions about the business's services

  When scheduling an appointment, please extract the following information:
  - Customer name
  - Email address
  - Phone number
  - Preferred date and time
  - Requested service

  You will be provided with a list of available dates and their remaining slots. Only schedule appointments on these available dates. If a requested date is not available, suggest the closest available date.

  When mentioning dates, use a natural, spoken form. For example, say "May 1st" instead of "2023-05-01".

  After extracting the appointment information, format it as a JSON object and include it in your response like this:
  [APPOINTMENT_DATA]{"customerName": "John Doe", "email": "john@example.com", "phone": "123-456-7890", "date": "2023-05-01", "time": "14:00", "service": "Haircut"}[/APPOINTMENT_DATA]

  Remember to conduct the exchange as if it was a phone call. Ask for one piece of information at a time, and use natural transitions between questions. Be polite, professional, and efficient in your responses. If you need more information to complete a task, ask for it clearly and conversationally.`

};

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Get or create conversation history for this session
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [systemMessage]);
    }
    const conversation = conversations.get(sessionId);

    // Fetch available dates
    const availableDates = await availableDateService.getAvailableDates();
    
    // Add available dates information to the conversation
    conversation.push({
      role: "system",
      content: `Available dates for appointments: ${availableDates.map(d => 
        `${formatDate(d.date)} (${d.availableSlots} slots)`
      ).join(', ')}`
    });

    // Add user message to conversation history
    conversation.push({ role: "user", content: message });

    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-3.5-turbo",
      messages: conversation,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const reply = response.data.choices[0].message.content;
    
    // Check if the reply contains appointment data
    const appointmentDataMatch = reply.match(/\[APPOINTMENT_DATA\](.*?)\[\/APPOINTMENT_DATA\]/);
    if (appointmentDataMatch) {
      const appointmentData = JSON.parse(appointmentDataMatch[1]);
      try {
        const savedAppointment = await appointmentService.createAppointment(appointmentData);
        console.log('Appointment saved:', savedAppointment);
      } catch (error) {
        console.error('Error saving appointment:', error.message);
        conversation.push({ role: "assistant", content: `I'm sorry, but the selected date is not available. Please choose another date.` });
      }
    }

    // Remove the appointment data from the reply
    const cleanReply = reply.replace(/\[APPOINTMENT_DATA\].*?\[\/APPOINTMENT_DATA\]/, '');
    
    // Add AI response to conversation history
    conversation.push({ role: "assistant", content: cleanReply });

    res.json({ reply: cleanReply });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Connect to MongoDB
const mongoose = require('mongoose');
const appointmentService = require('./services/appointmentService');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Add a new route to create appointments
app.post('/appointments', async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the appointment.' });
  }
});

// Add a new route to fetch appointments
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching appointments.' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const availableDateService = require('./services/availableDateService');

// Add available dates
app.post('/available-dates', async (req, res) => {
  try {
    const { date, slots } = req.body;
    const parsedDate = new Date(date);
    const availableDate = await availableDateService.addAvailableDate(parsedDate, slots);
    res.json(availableDate);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while adding available date.' });
  }
});

// Get available dates
app.get('/available-dates', async (req, res) => {
  try {
    const availableDates = await availableDateService.getAvailableDates();
    res.json(availableDates);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching available dates.' });
  }
});
