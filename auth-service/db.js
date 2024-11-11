const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config()

const uri = process.env.DB_URI
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

let isConnected = false

async function connectToDatabase() {
    if (!isConnected) {
        try {
            await client.connect();
            isConnected = true;
            console.log('Database connected successfully');
            return client
        } catch (error) {
            console.error('Failed to connect to the database', error);
            throw error;
        }
    } else {
        return client;
    }
}

module.exports = connectToDatabase