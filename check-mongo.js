// Script to check MongoDB for orders
require('dotenv').config(); // If there's a .env file
const { MongoClient } = require('mongodb');

// Try to get the connection string from various possible locations
const getConnectionString = () => {
  // Check if it's in environment variables
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // If not, check if we can find it in source files
  try {
    const fs = require('fs');
    
    // Try to find it in src/lib/db.ts
    if (fs.existsSync('./src/lib/db.ts')) {
      const dbContent = fs.readFileSync('./src/lib/db.ts', 'utf8');
      const match = dbContent.match(/DATABASE_URL\s*=\s*["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Try to find it in lib/db.ts if it exists
    if (fs.existsSync('./lib/db.ts')) {
      const dbContent = fs.readFileSync('./lib/db.ts', 'utf8');
      const match = dbContent.match(/DATABASE_URL\s*=\s*["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Try to find .env file in various locations
    const possibleEnvLocations = ['./.env', './prisma/.env', '../.env'];
    for (const location of possibleEnvLocations) {
      if (fs.existsSync(location)) {
        const envContent = fs.readFileSync(location, 'utf8');
        const match = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding connection string:', error);
    return null;
  }
};

async function checkMongoOrders() {
  let client;
  try {
    const connectionString = getConnectionString();
    
    if (!connectionString) {
      console.error('Could not find MongoDB connection string');
      return;
    }
    
    console.log('Connecting to MongoDB...');
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Determine the database name from the connection string
    const dbName = connectionString.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    
    // List all collections to find the orders collection
    console.log('\nListing collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
    // Check if there's an Order collection
    const orderCollectionName = collections.find(c => 
      c.name.toLowerCase() === 'order' || 
      c.name.toLowerCase() === 'orders'
    )?.name;
    
    if (!orderCollectionName) {
      console.log('No Order collection found');
      return;
    }
    
    const orderCollection = db.collection(orderCollectionName);
    
    // Get total count
    const totalOrders = await orderCollection.countDocuments();
    console.log(`\nTotal orders in database: ${totalOrders}`);
    
    // Query by phone number
    console.log('\nChecking for orders with phone 99999999:');
    const exactOrders = await orderCollection.find({ phoneNumber: '99999999' }).toArray();
    console.log(`Found ${exactOrders.length} orders with exact phone number 99999999`);
    
    // Also check with plus sign
    console.log('\nChecking for orders with phone +99999999:');
    const plusOrders = await orderCollection.find({ phoneNumber: '+99999999' }).toArray();
    console.log(`Found ${plusOrders.length} orders with +99999999`);
    
    // List some sample orders to check phone number format
    if (totalOrders > 0) {
      console.log('\nSample orders with phone numbers:');
      const sampleOrders = await orderCollection.find({}).limit(5).toArray();
      sampleOrders.forEach((order, index) => {
        console.log(`[${index + 1}] Order ID: ${order.orderId}, Phone: ${order.phoneNumber}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB connection closed');
    }
  }
}

checkMongoOrders(); 