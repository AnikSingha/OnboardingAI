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
    const database = client.db('auth');
    const appointmentsCollection = database.collection('appointments');

    let requestedDate = new Date(appointmentDate);
    // Query to check if the given appointment date already exists in the database
    const existingAppointment = await appointmentsCollection.findOne({
      date: requestedDate, // Convert string to Date object
    });

    if (existingAppointment) {
      console.log(`The appointment time ${appointmentDate} is already booked.`);
      return false; // Return false if the appointment is taken
    } else {
      console.log(`The appointment time ${appointmentDate} is available.`);
      return true; // Return true if the appointment is available
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    return null; // Return false in case of error
  }
};

const nextTime = async (appointmentDate) => {
  try {
        let requestedDate = new Date(appointmentDate); // Convert input date to Date object

        // Keep checking until an available slot is found
        while (true) {
        const isAvailable = await checkAvailability(requestedDate);

        if (isAvailable) {
            console.log(`Next available appointment is at ${requestedDate}`);
            return requestedDate; // Return the available date
        } else {
            // If the requested time is not available, increment by 15 minutes (or any other interval)
            requestedDate = new Date(requestedDate.getTime() + 15 * 60 * 1000); // 15 minutes
            console.log(`Trying the next available slot at ${requestedDate}`);
        }
        }
    } catch (error) {
        console.error('Error finding next available time:', error);
        return null; // Return null if there's an error
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
  isConnected
};
