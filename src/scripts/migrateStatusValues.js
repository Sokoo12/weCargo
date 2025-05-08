// Script to migrate legacy status values to current valid values
require('dotenv').config();
const { MongoClient } = require('mongodb');

// Map of legacy status values to current valid values
const STATUS_MAPPING = {
  'PENDING': 'IN_WAREHOUSE',
  'CUSTOMS_HOLD': 'IN_TRANSIT', 
  'PROCESSING': 'IN_WAREHOUSE',
  'PREPARING': 'IN_WAREHOUSE',
  'READY_FOR_PICKUP': 'OUT_FOR_DELIVERY',
  'COMPLETED': 'DELIVERED'
};

// Current valid status values from the OrderStatus enum
const VALID_STATUSES = [
  'IN_WAREHOUSE',
  'IN_TRANSIT',
  'IN_UB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
];

async function migrateStatusValues() {
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

    // Get all unique status values in the Order collection
    const orderStatusValues = await db.collection('Order')
      .distinct('status');
    
    console.log('Current status values in Order collection:', orderStatusValues);

    // Get all unique status values in the StatusHistory collection
    const historyStatusValues = await db.collection('StatusHistory')
      .distinct('status');
    
    console.log('Current status values in StatusHistory collection:', historyStatusValues);

    // Find invalid status values
    const invalidOrderStatuses = orderStatusValues.filter(
      status => status !== null && !VALID_STATUSES.includes(status)
    );
    
    const invalidHistoryStatuses = historyStatusValues.filter(
      status => status !== null && !VALID_STATUSES.includes(status)
    );

    console.log('Invalid status values in Order collection:', invalidOrderStatuses);
    console.log('Invalid status values in StatusHistory collection:', invalidHistoryStatuses);

    // Migrate each invalid status using the mapping
    for (const invalidStatus of invalidOrderStatuses) {
      const newStatus = STATUS_MAPPING[invalidStatus] || 'IN_WAREHOUSE'; // Default to IN_WAREHOUSE
      
      const result = await db.collection('Order').updateMany(
        { status: invalidStatus },
        { $set: { status: newStatus } }
      );
      
      console.log(`Migrated ${result.modifiedCount} Order documents from "${invalidStatus}" to "${newStatus}"`);
    }

    for (const invalidStatus of invalidHistoryStatuses) {
      const newStatus = STATUS_MAPPING[invalidStatus] || 'IN_WAREHOUSE'; // Default to IN_WAREHOUSE
      
      const result = await db.collection('StatusHistory').updateMany(
        { status: invalidStatus },
        { $set: { status: newStatus } }
      );
      
      console.log(`Migrated ${result.modifiedCount} StatusHistory documents from "${invalidStatus}" to "${newStatus}"`);
    }

    // Verify results
    const remainingInvalidOrderStatuses = await db.collection('Order')
      .distinct('status', { status: { $nin: VALID_STATUSES } });
    
    const remainingInvalidHistoryStatuses = await db.collection('StatusHistory')
      .distinct('status', { status: { $nin: VALID_STATUSES } });
    
    console.log('Remaining invalid status values in Order collection:', remainingInvalidOrderStatuses);
    console.log('Remaining invalid status values in StatusHistory collection:', remainingInvalidHistoryStatuses);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateStatusValues(); 