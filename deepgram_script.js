require('dotenv').config();
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

const transcribeFile = async () => {
  try {
    const base64Audio = fs.readFileSync('received_audio.mulaw', 'utf-8');
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    fs.writeFileSync('raw_audio.mulaw', audioBuffer);

    const pcmBuffer = Buffer.alloc(audioBuffer.length * 2);
    for (let i = 0; i < audioBuffer.length; i++) {
      const ulawSample = audioBuffer[i];
      const pcmSample = muLawToLinearPCM(ulawSample);
      pcmBuffer.writeInt16LE(Math.max(-32768, Math.min(32767, pcmSample)), i * 2);
    }

    fs.writeFileSync('converted_audio.pcm', pcmBuffer);

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    const response = await deepgram.listen.prerecorded.transcribeFile(
      {
        buffer: pcmBuffer,
        mimetype: 'audio/raw',
      },
      {
        model: 'nova-2',
        smart_format: true,
        encoding: 'linear16',
        sample_rate: 8000,
        channels: 1,
      }
    );

    if (response && response.results && response.results.channels[0].alternatives[0].transcript) {
      console.log('Transcript:', response.results.channels[0].alternatives[0].transcript);
    } else {
      console.log('No transcript available. Please check the audio quality.');
    }
  } catch (err) {
    console.error('Error processing audio file:', err);
  }
};

const muLawToLinearPCM = (ulawByte) => {
  const MULAW_MAX = 0x1FFF;
  const MULAW_BIAS = 33;
  ulawByte = ~ulawByte;
  let sign = (ulawByte & 0x80) ? -1 : 1;
  let exponent = (ulawByte & 0x70) >> 4;
  let mantissa = ulawByte & 0x0F;
  let sample = (mantissa << 4) + MULAW_BIAS;
  sample <<= exponent;
  sample -= MULAW_BIAS;
  return sign * sample;
};

transcribeFile();