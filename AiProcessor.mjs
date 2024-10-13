import OpenAI from 'openai';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processTranscript(transcript) {
  if (!transcript || transcript.trim() === '') {
    console.log('Received empty transcript.');
    return 'I did not catch that. Could you please repeat?';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly assistant that helps users with general inquiries.',
        },
        { role: 'user', content: transcript },
      ],
    });

    const assistantResponse = response.choices[0].message.content;
    console.log(chalk.green('Assistant Response:', assistantResponse));

    return assistantResponse;
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
}
