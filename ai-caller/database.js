const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.DB_URI;
const client = new MongoClient(MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  maxPoolSize: 10,
  minPoolSize: 1
});

let dbConnection;

const getDb = async () => {
  if (!dbConnection) {
    await client.connect();
    dbConnection = client.db('auth');
  }
  return dbConnection;
};

const updateLeadInfo = async (phoneNumber, leadInfo) => {
  try {
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    await leadsCollection.updateOne(
      { _number: phoneNumber },
      { $set: leadInfo },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating lead information:', error);
  }
};



module.exports = {
  updateLeadInfo,
  getDb
};