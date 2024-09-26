require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  console.error('DEEPGRAM_API_KEY is not set in your environment variables.');
  process.exit(1);
}

async function testDeepgramTTS() {
  const text = "Hello, this is a test of Deepgram's text-to-speech API.";
  
  try {
    console.log('Sending request to Deepgram TTS API...');
    const response = await axios({
      method: 'post',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        voice: 'aura-asteria-en',
        encoding: 'mp3',
      },
      responseType: 'arraybuffer'
    });

    console.log('Response received. Saving audio file...');
    fs.writeFileSync('test_tts_output.mp3', response.data);
    console.log('Audio file saved as test_tts_output.mp3');
  } catch (error) {
    console.error('Error occurred:', error.response ? error.response.data.toString() : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testDeepgramTTS();