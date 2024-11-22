const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.DB_URI;
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: true,
  maxPoolSize: 10,
  minPoolSize: 1
});

let dbConnection;

const connectToDatabase = async () => {
  if (!dbConnection) {
    await client.connect();
    dbConnection = client.db('auth');
    console.log('Database connected successfully');
  }
  return dbConnection;
};

const getDb = async () => {
  return await connectToDatabase();
};

const updateLeadInfo = async (phoneNumber, leadInfo) => {
  try {
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    const result = await leadsCollection.updateOne(
      { _number: phoneNumber },
      { $set: leadInfo },
      { upsert: true }
    );
    return result;
  } catch (error) {
    console.error('Error updating lead information:', error);
    throw error;
  }
};

const getLeads = async () => {
  try {
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    return await leadsCollection.find().toArray();
  } catch (error) {
    console.error('Error getting leads:', error);
    throw error;
  }
};

const addLead = async (number, name) => {
  try {
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    const result = await leadsCollection.insertOne({
      _number: number,
      name: name
    });
    return result.acknowledged;
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};

const deleteLead = async (leadId) => {
  try {
    if (!ObjectId.isValid(leadId)) {
      return false;
    }
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    const result = await leadsCollection.deleteOne({
      _id: new ObjectId(leadId)
    });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (dbConnection) {
      await client.close();
      dbConnection = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = {
  connectToDatabase,
  getDb,
  updateLeadInfo,
  getLeads,
  addLead,
  deleteLead,
  closeConnection
};