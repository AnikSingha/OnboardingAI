require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));


const businessSchema = new mongoose.Schema({
  name: String,
  officialNumber: String,
  twilioNumber: String,
  
});

const Business = mongoose.model('Business', businessSchema);


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);


app.post('/api/businesses', async (req, res) => {
  const { name, officialNumber} = req.body;

  try {
    const existingTwilioNumber = process.env.TWILIO_PHONE_NUMBER

    if (existingTwilioNumber.length === 0) {
      return res.status(400).json({ error: 'Number is not valid' });
    }

    const newBusiness = new Business({
      name,
      officialNumber,
      twilioNumber: existingTwilioNumber,
    });

    await newBusiness.save();

    res.status(201).json(newBusiness);
  } catch (error) {
    console.error('Error registering business:', error);
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/businesses', async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/call', async (req, res) => {
  const { toNumber, businessId } = req.body;
  
  try {
    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const call = await twilioClient.calls.create({
      url: `${process.env.NGROK_URL}/api/calls/voice?businessId=${businessId}`,
      to: toNumber,
      from: business.twilioNumber,
    });
    
    res.status(200).json({ callSid: call.sid });
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/calls/voice', async (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  const businessId = req.query.businessId;
  const isReturning = req.query.isReturning === 'true';

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      twiml.say('Sorry, the business is not available at the moment.');
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    if (!isReturning) {
      twiml.say('Hello, this is your AI assistant. How can I help you today?');
    }

    const gather = twiml.gather({
      input: 'speech',
      timeout: 5,
      language: 'en-US',
      action: `${process.env.NGROK_URL}/api/calls/process?businessId=${businessId}`,
      method: 'POST',
    });

    if (isReturning) {
      gather.say('What else can I help you with?');
    } else {
      gather.say('Please tell me how I can assist you.');
    }

    // Handle the case where no input is received
    twiml.redirect(`${process.env.NGROK_URL}/api/calls/no-input?businessId=${businessId}&isReturning=${isReturning}`);

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling voice webhook:', error);
    twiml.say('An error occurred. Please try again later.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
});


app.post('/api/calls/no-input', (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  const businessId = req.query.businessId;
  const isReturning = req.query.isReturning === 'true';
  twiml.say('We did not receive any input.');

  if (isReturning) {
    twiml.say('Please let me know if there is anything else I can assist you with.');
    twiml.redirect(`${process.env.NGROK_URL}/api/calls/voice?businessId=${businessId}&isReturning=true`);
  } else {
    twiml.say('Goodbye.');
    twiml.hangup();
  }

  res.type('text/xml');
  res.send(twiml.toString());
});


app.post('/api/calls/process', async (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  const businessId = req.query.businessId;
  const speechResult = req.body.SpeechResult;
  const digits = req.body.Digits;

  console.log('Request Body:', req.body);

  try {
    const business = await Business.findById(businessId);
    if (!business) {
      twiml.say('Sorry, the business is not available at the moment.');
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    let userInput = speechResult || digits;
    if (!userInput) {
      twiml.say('Sorry, I did not receive any input.');
      twiml.redirect(`${process.env.NGROK_URL}/api/calls/voice?businessId=${businessId}`);
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    if (digits) {
      switch (digits) {
        case '1':
          userInput = 'I would like to schedule an appointment.';
          break;
        case '2':
          userInput = 'I need support.';
          break;
        default:
          userInput = 'I need assistance.';
      }
    }

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userInput }],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiText = openaiResponse.data.choices[0].message.content.trim();


    twiml.say(aiText);
    twiml.say('Is there anything else I can help you with?');
    twiml.redirect(`${process.env.NGROK_URL}/api/calls/voice?businessId=${businessId}&isReturning=true`);

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error processing input:', error);
    if (error.response && error.response.data) {
      console.error('OpenAI API Error Response:', error.response.data);
    }
    twiml.say('I encountered an error while processing your request.');
    twiml.redirect(`${process.env.NGROK_URL}/api/calls/voice?businessId=${businessId}`);
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});