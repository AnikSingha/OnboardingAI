const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const OFFICE_TIMEZONE = process.env.TIMEZONE || 'America/New_York';
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
    return [];
  }
};

const addLead = async (number, name) => {
  try {
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    const result = await leadsCollection.insertOne({
      _number: number,
      name: name,
      created_at: new Date()
    });
    return result.acknowledged;
  } catch (error) {
    console.error('Error adding lead:', error);
    return false;
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

const checkAvailability = async (appointmentDate) => {
  try {
    const db = await getDb();
    const schedulesCollection = db.collection('schedules');
    
    // Convert the check date to UTC for comparison
    const utcDate = zonedTimeToUtc(appointmentDate, OFFICE_TIMEZONE);
    
    const existingAppointment = await schedulesCollection.findOne({
      date: utcDate
    });

    return !existingAppointment;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
};

const nextTime = async (appointmentDate) => {
  try {
    let requestedDate = new Date(appointmentDate);

    while (true) {
      const isAvailable = await checkAvailability(requestedDate);

      if (isAvailable) {
        console.log(`Next available appointment is at ${requestedDate}`);
        return requestedDate;
      } else {
        requestedDate = new Date(requestedDate.getTime() + 15 * 60 * 1000);
        console.log(`Trying the next available slot at ${requestedDate}`);
      }
    }
  } catch (error) {
    console.error('Error finding next available time:', error);
    return null;
  }
};

const createAppointment = async (name, number, appointmentDate) => {
  try {
    const db = await getDb();
    const schedulesCollection = db.collection('schedules');
    
    const newAppointment = {
      name: name,
      number: number,
      date: appointmentDate, // This should already be in UTC from zonedTimeToUtc
      created_at: new Date()
    };
    
    const result = await schedulesCollection.insertOne(newAppointment);
    return result.acknowledged;
  } catch (error) {
    console.error('Error creating appointment:', error);
    return false;
  }
};

const leadExists = async (phoneNumber) => {
  try {
    const db = await getDb();
    const leadsCollection = db.collection('leads');
    const lead = await leadsCollection.findOne({ _number: phoneNumber });
    return !!lead;
  } catch (error) {
    console.error('Error checking if lead exists:', error);
    return false;
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
  closeConnection,
  checkAvailability,
  nextTime,
  isConnected,
  createAppointment,
  leadExists,
};
