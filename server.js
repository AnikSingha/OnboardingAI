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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
