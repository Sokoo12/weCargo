// This script directly connects to MongoDB to update any documents with PENDING status
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function fixPendingStatus() {
  // Get MongoDB connection string from environment variable
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('DATABASE_URL environment variable not found');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    // Parse database name from connection string
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    // Update Order collection
    console.log('Checking Order collection for PENDING status...');
    const orderResult = await db.collection('Order').updateMany(
      { status: 'PENDING' },
      { $set: { status: 'IN_WAREHOUSE' } }
    );
    
    console.log(`Updated ${orderResult.modifiedCount} Order documents from PENDING to IN_WAREHOUSE`);

    // Update StatusHistory collection
    console.log('Checking StatusHistory collection for PENDING status...');
    const historyResult = await db.collection('StatusHistory').updateMany(
      { status: 'PENDING' },
      { $set: { status: 'IN_WAREHOUSE' } }
    );
    
    console.log(`Updated ${historyResult.modifiedCount} StatusHistory documents from PENDING to IN_WAREHOUSE`);

    // Verify updates
    const remainingOrders = await db.collection('Order').find({ status: 'PENDING' }).toArray();
    const remainingHistory = await db.collection('StatusHistory').find({ status: 'PENDING' }).toArray();
    
    console.log(`Remaining Order documents with PENDING status: ${remainingOrders.length}`);
    console.log(`Remaining StatusHistory documents with PENDING status: ${remainingHistory.length}`);

    console.log('Fix completed successfully!');
  } catch (error) {
    console.error('Error during fix:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the fix
fixPendingStatus(); 