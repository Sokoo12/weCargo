// Script to check for orders with a specific phone number
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkOrders() {
  try {
    console.log('Starting database checks...');
    
    // Basic connection test
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`Database connection successful. User count: ${userCount}`);
    
    // Check for the user with this phone number
    console.log('\nChecking for user with phone 99999999...');
    const user = await prisma.user.findUnique({
      where: { phoneNumber: '99999999' }
    });
    
    console.log('User with phone 99999999:', user);
    
    // Check for orders with exact phone number
    console.log('\nChecking for orders with exact phone 99999999...');
    const exactOrders = await prisma.order.findMany({
      where: { phoneNumber: '99999999' },
      include: { statusHistory: true }
    });
    
    console.log(`Found ${exactOrders.length} orders with exact phone 99999999:`);
    console.log(JSON.stringify(exactOrders, null, 2));
    
    // Also try with plus sign format
    console.log('\nChecking for orders with +99999999...');
    const plusOrders = await prisma.order.findMany({
      where: { phoneNumber: '+99999999' },
      include: { statusHistory: true }
    });
    
    console.log(`Found ${plusOrders.length} orders with +99999999`);
    
    // Get total count of all orders
    const totalOrders = await prisma.order.count();
    console.log(`\nTotal orders in database: ${totalOrders}`);
    
    // List some recent orders to check format
    if (totalOrders > 0) {
      console.log('\nListing recent orders to check phone number format:');
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      
      recentOrders.forEach(order => {
        console.log(`- Order ID: ${order.orderId}, Package ID: ${order.packageId}, Phone: ${order.phoneNumber}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed.');
  }
}

checkOrders(); 