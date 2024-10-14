import OpenAI from 'openai';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversations = new Map();

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

  Remember to conduct the exchange as if it was a phone call. Ask for one piece of information at a time, and use natural transitions between questions. Be polite, professional, and efficient in your responses. If you need more information to complete a task, ask for it clearly and conversationally.

  When presenting available dates to the user, format them in a natural, conversational way.`

};

export async function processTranscript(transcript, sessionId) {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  try {
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [systemMessage]);
    }
    const conversation = conversations.get(sessionId);

    conversation.push({ role: "user", content: transcript });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversation,
    });

    const reply = response.choices[0].message.content;

    const appointmentDataMatch = reply.match(/\[APPOINTMENT_DATA\](.*?)\[\/APPOINTMENT_DATA\]/);
    if (appointmentDataMatch) {
      const appointmentData = JSON.parse(appointmentDataMatch[1]);
      try {
        //const savedAppointment = await appointmentService.createAppointment(appointmentData);
        console.log('Appointment saved:', savedAppointment);
      } catch (error) {
        console.error('Error saving appointment:', error.message);
        conversation.push({ role: "assistant", content: `I'm sorry, but the selected date is not available. Please choose another date.` });
      }
    }

    const assistantResponse = reply.replace(/\[APPOINTMENT_DATA\].*?\[\/APPOINTMENT_DATA\]/, '');

    conversation.push({ role: "assistant", content: assistantResponse });


    console.log(chalk.green('Assistant Response:', assistantResponse));

    return assistantResponse;
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
}
