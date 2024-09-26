require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function testDeepgramTTS() {
  try {
    const response = await axios.post(
      'https://api.deepgram.com/v1/speak?model=aura-helios-en',
      { text: "Hello! How can I assist you today?" },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        },
        responseType: 'arraybuffer',
      }
    );

    fs.writeFileSync('test_tts.mp3', Buffer.from(response.data));
    console.log('TTS audio saved as test_tts.mp3');
  } catch (error) {
    console.error('Error testing Deepgram TTS:', error.response ? error.response.data : error);
  }
}

testDeepgramTTS();