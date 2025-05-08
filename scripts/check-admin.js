// This script checks the admin document structure
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db('wecargo_db');
    const adminsCollection = database.collection('Admin');
    
    // Find admin
    const admin = await adminsCollection.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('Admin not found!');
      return;
    }
    
    console.log('Admin document found:');
    console.log(JSON.stringify(admin, null, 2));
    console.log('\nProperty names:');
    console.log(Object.keys(admin));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

run(); 