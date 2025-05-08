// This script directly creates an admin in MongoDB
// Usage: node scripts/direct-db-admin.js admin@example.com password

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  if (process.argv.length !== 4) {
    console.error('Usage: node scripts/direct-db-admin.js <email> <password>');
    process.exit(1);
  }

  const [email, password] = process.argv.slice(2);
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db('wecargo_db'); // Your database name from connection string
    const adminsCollection = database.collection('Admin');
    
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ email });
    
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists!`);
      return;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create admin document
    const now = new Date();
    const admin = {
      _id: new ObjectId(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now
    };
    
    // Insert admin
    const result = await adminsCollection.insertOne(admin);
    
    console.log(`Admin created successfully with email: ${email}`);
    console.log(`ID: ${admin._id}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

run(); 