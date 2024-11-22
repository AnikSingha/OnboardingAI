const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

let isConnected = false;


const connectToDatabase = async () => {
  if (!isConnected) {
    try {
        await client.connect();
        isConnected = true;
        console.log('Database connected successfully');
        return client;
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
  }
  return client;
};

const getDb = async () => {
  const client = await connectToDatabase();
  return client.db('auth');
};

const updateLeadInfo = async (phoneNumber, leadInfo) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
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
    if (isConnected) {
      await client.close();
      isConnected = false;
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