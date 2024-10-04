import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import expressWs from 'express-ws';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import OpenAI from 'openai';
import fs from 'fs';

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3000;


const deepgram = createClient(process.env.DEEPGRAM_API_KEY);


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/twilio-stream', (req, res) => {
  const response = `
    <Response>
      <Connect>
        <Stream url="wss://${req.headers.host}/media" />
      </Connect>
    </Response>
  `;
  res.type('text/xml');
  res.send(response);
});


app.ws('/media', (ws, req) => {
  let streamSid;
  let callSid;
  let dgLive;
  let audioBufferQueue = [];
  let interactionCount = 0; // For managing audio order
  let expectedAudioIndex = 0;
  const audioBuffers = {};

  console.log('WebSocket connection established');

  // Function to send audio frames to Twilio
  const sendAudioFrames = async (audioBuffer, ws, streamSid, index) => {

    if (index === expectedAudioIndex) {
      await sendBufferedAudio(audioBuffer, ws, streamSid);
      expectedAudioIndex++;


      while (audioBuffers[expectedAudioIndex]) {
        await sendBufferedAudio(audioBuffers[expectedAudioIndex], ws, streamSid);
        delete audioBuffers[expectedAudioIndex];
        expectedAudioIndex++;
      }
    } else {
      audioBuffers[index] = audioBuffer;
    }
  };

  const sendBufferedAudio = async (audioBuffer, ws, streamSid) => {
    const frameSize = 160;
    const frameDurationMs = 20;

    for (let i = 0; i < audioBuffer.length; i += frameSize) {
      const frame = audioBuffer.slice(i, i + frameSize);
      const frameBase64 = frame.toString('base64');


      ws.send(
        JSON.stringify({
          event: 'media',
          streamSid: streamSid,
          media: {
            payload: frameBase64,
          },
        }),
        (error) => {
          if (error) {
            console.error('Error sending TTS audio frame to Twilio:', error);
          }
        }
      );


      await new Promise((resolve) => setTimeout(resolve, frameDurationMs));
    }


    const markLabel = uuidv4(); // Use the 'uuid' library
    ws.send(
      JSON.stringify({
        event: 'mark',
        streamSid: streamSid,
        mark: {
          name: markLabel,
        },
      })
    );
  };

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.event === 'start') {
      streamSid = data.start.streamSid;
      callSid = data.start.callSid;

      console.log(`Stream started: ${streamSid}`);


      dgLive = deepgram.listen.live({
        encoding: 'mulaw',
        sample_rate: 8000,
        channels: 1,
        model: 'nova',
        punctuate: true,
        interim_results: true,
      });


      dgLive.on(LiveTranscriptionEvents.Open, async () => {
        console.log('Deepgram Live Transcription connection opened.');


        if (audioBufferQueue.length > 0) {
          console.log(`Sending ${audioBufferQueue.length} buffered audio chunks to Deepgram.`);
          audioBufferQueue.forEach((buffer) => {
            dgLive.send(buffer);
          });
          audioBufferQueue.length = 0; // Clear the buffer
        }


        const initialMessage = 'Hey, how can I help you?';
        console.log('Sending initial message to user:', initialMessage);


        const ttsAudioBuffer = await generateTTS(initialMessage);


        await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);

        console.log('Initial TTS audio sent to Twilio.');
        interactionCount++;
      });

      dgLive.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
        console.log('Transcription received:', JSON.stringify(transcription, null, 2));

        if (transcription.type === 'UtteranceEnd') {
          console.log('UtteranceEnd detected.');

        }

        const alternatives = transcription.channel.alternatives[0];
        const transcript = alternatives.transcript;

        if (transcript && transcription.is_final) {
          console.log('Final Transcription:', transcript);


          const assistantResponse = await processTranscript(transcript);


          const ttsAudioBuffer = await generateTTS(assistantResponse);


          await sendAudioFrames(ttsAudioBuffer, ws, streamSid, interactionCount);

          console.log('Assistant response sent to Twilio.');
          interactionCount++;
        }
      });

      dgLive.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
      });

      dgLive.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram Live Transcription connection closed.');
      });

    } else if (data.event === 'media') {
      const audioBufferData = Buffer.from(data.media.payload, 'base64');
      console.log(`Received media event, audioBuffer length: ${audioBufferData.length}`);
    

      fs.appendFileSync('received_audio.mulaw', audioBufferData);
    

      if (dgLive && dgLive.getReadyState() === 1) {
        dgLive.send(audioBufferData);
        console.log('Audio buffer sent to Deepgram.');
      } else {
        console.log('Deepgram connection not open. Buffering audio data.');
        audioBufferQueue.push(audioBufferData);
      }
    } else if (data.event === 'stop') {
      console.log('Stream stopped.');
      if (dgLive) {
        dgLive.finish();
      }
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (dgLive) {
      dgLive.finish();
    }

    audioBufferQueue.length = 0;
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});


const processTranscript = async (transcript) => {
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
    console.log('Assistant Response:', assistantResponse);

    return assistantResponse;
  } catch (error) {
    console.error('Error in processTranscript:', error.response ? error.response.data : error.message);
    return 'Sorry, I am unable to process your request at the moment.';
  }
};



const generateTTS = async (text) => {
  try {

    const ttsResponse = await axios.post(
      'https://api.deepgram.com/v1/speak',
      {
        text: text,
      },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'audio/mulaw',
        },
        params: {
          encoding: 'mulaw',
          container: 'none',
          sample_rate: 8000,
        },
        responseType: 'arraybuffer',
      }
    );

    if (ttsResponse.status !== 200) {
      console.error('Failed to generate TTS from Deepgram');
      console.error('TTS Response:', ttsResponse.data.toString());
      throw new Error('TTS generation failed');
    } else {
      console.log('TTS audio generated successfully.');
    }

    const ttsAudioBuffer = Buffer.from(ttsResponse.data);
    return ttsAudioBuffer;
  } catch (error) {
    console.error('Error in generateTTS:', error);
    throw error;
  }
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
