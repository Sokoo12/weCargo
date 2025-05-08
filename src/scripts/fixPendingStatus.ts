import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPendingStatus() {
  console.log('Starting fix for PENDING status...');
  
  try {
    // Find entries with raw MongoDB query for debugging
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING'
      }
    });
    
    console.log('Orders with PENDING status:', pendingOrders.length);
    console.log(pendingOrders);
    
    // Update orders with PENDING status to IN_WAREHOUSE
    const updateOrders = await prisma.order.updateMany({
      where: {
        status: 'PENDING'
      },
      data: {
        status: 'IN_WAREHOUSE'
      }
    });
    
    console.log('Updated orders:', updateOrders);
    
    // Find status history entries with PENDING
    const pendingStatusHistory = await prisma.statusHistory.findMany({
      where: {
        status: 'PENDING'
      }
    });
    
    console.log('Status history entries with PENDING:', pendingStatusHistory.length);
    console.log(pendingStatusHistory);
    
    // Update status history entries with PENDING to IN_WAREHOUSE
    const updateStatusHistory = await prisma.statusHistory.updateMany({
      where: {
        status: 'PENDING'
      },
      data: {
        status: 'IN_WAREHOUSE'
      }
    });
    
    console.log('Updated status history entries:', updateStatusHistory);
    
    console.log('Fix completed successfully!');
  } catch (error) {
    console.error('Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPendingStatus(); 