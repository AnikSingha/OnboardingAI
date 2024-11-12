// mongodb.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.DB_URI;
const client = new MongoClient(MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});

// Function to connect to MongoDB
export const connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Function to update lead information in MongoDB
export const updateLeadInfo = async (phoneNumber, leadInfo) => {
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
