const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.DB_URI;
const client = new MongoClient(MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});

// Function to connect to MongoDB
const connectToMongoDB = async () => {
  console.log('Connecting to MongoDB');
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Function to update lead information in MongoDB
const updateLeadInfo = async (phoneNumber, leadInfo) => {
  try {
    const database = client.db('auth');
    const leadsCollection = database.collection('leads');

    await leadsCollection.updateOne(
      { _number: phoneNumber },
      { $set: { name: leadInfo.name } },
      { upsert: true }
    );

    console.log(`Lead info updated for phone number: ${phoneNumber}`);
  } catch (error) {
    console.error('Error updating lead information:', error);
  }
};


module.exports = {
  connectToMongoDB,
  updateLeadInfo
};