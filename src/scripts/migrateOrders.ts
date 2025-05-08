import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOrders() {
  console.log('Starting order migration...');
  
  try {
    // Get all orders
    const orders = await prisma.order.findMany({
      include: {
        orderDetails: true
      }
    });
    console.log(`Found ${orders.length} orders to migrate`);
    
    // Process each order
    for (const order of orders) {
      console.log(`Migrating order ${order.id} (${order.packageId})`);
      
      // Create orderId if it doesn't exist (use packageId as the orderId for now)
      const orderId = order.orderId || order.packageId;
      
      // Determine isShipped based on status
      // We'll assume orders that are DELIVERED or OUT_FOR_DELIVERY are shipped
      const isShipped = 
        order.status === 'DELIVERED' || 
        order.status === 'OUT_FOR_DELIVERY';
      
      // Convert isBroken to isDamaged if it exists
      const isDamaged = !!order.isBroken;
      
      // Update the order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderId,
          isShipped,
          isDamaged,
          // Convert note to damageDescription if isDamaged is true
          damageDescription: isDamaged ? order.note || undefined : undefined,
        }
      });
      
      // If isShipped is true, create orderDetails if they don't exist
      if (isShipped && !(order as any).orderDetails) {
        await prisma.orderDetails.create({
          data: {
            orderId: order.id,
            totalQuantity: 1, // Default values
            shippedQuantity: 1,
            largeItemQuantity: order.size === 'LARGE' ? 1 : 0,
            smallItemQuantity: order.size === 'SMALL' ? 1 : 0,
            priceRMB: 0,
            priceTonggur: 0,
            deliveryAvailable: !!order.deliveryAddress,
            comments: order.note || undefined,
          }
        });
      }
      
      console.log(`Successfully migrated order ${order.id}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateOrders(); 