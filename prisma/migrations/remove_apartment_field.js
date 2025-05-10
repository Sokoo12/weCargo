/**
 * Migration script to remove the apartment field from the OrderDelivery collection
 * 
 * To run this script:
 * 1. Make sure you're connected to MongoDB
 * 2. Run: node prisma/migrations/remove_apartment_field.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db(); // Default database from connection string
    const orderDeliveryCollection = database.collection('OrderDelivery');

    // Update documents to remove the apartment field
    const result = await orderDeliveryCollection.updateMany(
      {}, // All documents
      { $unset: { apartment: "" } } // Remove apartment field
    );

    console.log(`Removed apartment field from ${result.modifiedCount} delivery records`);
  } catch (error) {
    console.error('Error removing apartment field:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error); 