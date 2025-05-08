// This script updates admin passwords from plain text to hashed
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
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
    
    // Find all admins with plain text passwords
    const admins = await adminsCollection.find({ password: { $exists: true } }).toArray();
    
    console.log(`Found ${admins.length} admin(s) with plain text passwords`);
    
    for (const admin of admins) {
      console.log(`Processing admin: ${admin.email}`);
      
      // Hash the password
      const passwordHash = await bcrypt.hash(admin.password, 10);
      
      // Update the document to use passwordHash and remove plain text password
      const result = await adminsCollection.updateOne(
        { _id: admin._id },
        { 
          $set: { passwordHash },
          $unset: { password: "" }
        }
      );
      
      console.log(`Updated admin: ${admin.email}, matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

run(); 