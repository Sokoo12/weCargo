import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { OrderStatus } from "@/types/enums";

// Map application enum values to Prisma enum values
const mapStatusToPrisma = (status: OrderStatus): PrismaOrderStatus => {
  // Both enums have matching values but TypeScript needs explicit mapping
  switch(status) {
    case OrderStatus.IN_WAREHOUSE:
      return 'IN_WAREHOUSE' as PrismaOrderStatus;
    case OrderStatus.IN_TRANSIT:
      return 'IN_TRANSIT' as PrismaOrderStatus;
    case OrderStatus.IN_UB:
      return 'IN_UB' as PrismaOrderStatus;
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'OUT_FOR_DELIVERY' as PrismaOrderStatus;
    case OrderStatus.DELIVERED:
      return 'DELIVERED' as PrismaOrderStatus;
    case OrderStatus.CANCELLED:
      return 'CANCELLED' as PrismaOrderStatus;
    default:
      return 'IN_WAREHOUSE' as PrismaOrderStatus;
  }
};

export async function GET(
  request: Request, 
  { params }: { params: { orderId: string } }
) {
  try {
    const idParam = params.orderId;
    let order = null;
    
    // Check if the orderId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(idParam);
    
    if (isValidObjectId) {
      // First try to find by MongoDB ID
      order = await db.order.findUnique({
        where: { id: idParam },
        include: {
          statusHistory: true,
          orderDetails: true,
        },
      });
    }

    // If not found by MongoDB id, try to find by orderId or packageId
    if (!order) {
      // Find orders where orderId or packageId matches
      const orders = await db.order.findMany({
        where: { 
          OR: [
            { orderId: idParam },
            { packageId: idParam }
          ]
        },
        include: {
          statusHistory: true,
          orderDetails: true,
        },
      });

      if (orders.length > 0) {
        order = orders[0];
      }
    }

    if (!order) {
      console.error(`Order not found for ID: ${idParam}`);
      return NextResponse.json({ 
        error: "Order not found", 
        details: `No order found with ID, orderId, or packageId matching: ${idParam}` 
      }, { status: 404 });
    }

    // Sort status history by timestamp (oldest first)
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      order.statusHistory.sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Validate MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    // First, check if order has orderDetails
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order is shipped, it might have orderDetails
    if (order.isShipped) {
      // Find and delete orderDetails
      const orderDetails = await db.orderDetails.findUnique({
        where: { orderId: orderId },
      });
      
      if (orderDetails) {
        await db.orderDetails.delete({
          where: { id: orderDetails.id },
        });
      }
    }

    // Then, delete status history entries
    await db.statusHistory.deleteMany({
      where: { orderId: orderId },
    });

    // Finally, delete the order
    await db.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request, 
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Validate MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      orderId: newOrderId,
      packageId,
      phoneNumber,
      isShipped,
      isDamaged,
      damageDescription,
      status,
      orderDetails,
      createdAt,
    } = body;

    // Fetch the current order
    const currentOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: true,
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get existing orderDetails if any
    let existingOrderDetails = null;
    if (currentOrder.isShipped) {
      existingOrderDetails = await db.orderDetails.findUnique({
        where: { orderId: orderId },
      });
    }

    // Check if the status has changed
    const statusChanged = 
      currentOrder.statusHistory.length === 0 || 
      currentOrder.statusHistory[currentOrder.statusHistory.length - 1].status !== status;
    
    // Update the order
    const updateData: any = {
      orderId: newOrderId,
      packageId,
      phoneNumber,
      isShipped,
      isDamaged: isDamaged ?? false,
      damageDescription: isDamaged ? damageDescription : null,
      createdAt: createdAt || currentOrder.createdAt,
      status: mapStatusToPrisma(status as OrderStatus),
    };

    // Handle order details based on isShipped status
    if (isShipped) {
      // If order is now shipped and we have details, upsert them
      if (orderDetails) {
        if (existingOrderDetails) {
          // Update existing order details
          await db.orderDetails.update({
            where: { id: existingOrderDetails.id },
            data: {
              totalQuantity: orderDetails.totalQuantity,
              shippedQuantity: orderDetails.shippedQuantity,
              largeItemQuantity: orderDetails.largeItemQuantity,
              smallItemQuantity: orderDetails.smallItemQuantity,
              priceRMB: orderDetails.priceRMB,
              priceTonggur: orderDetails.priceTonggur,
              deliveryAvailable: orderDetails.deliveryAvailable,
              comments: orderDetails.comments,
            }
          });
        } else {
          // Create new order details
          await db.orderDetails.create({
            data: {
              orderId: orderId,
              totalQuantity: orderDetails.totalQuantity,
              shippedQuantity: orderDetails.shippedQuantity,
              largeItemQuantity: orderDetails.largeItemQuantity,
              smallItemQuantity: orderDetails.smallItemQuantity,
              priceRMB: orderDetails.priceRMB,
              priceTonggur: orderDetails.priceTonggur,
              deliveryAvailable: orderDetails.deliveryAvailable,
              comments: orderDetails.comments,
            }
          });
        }
      }
    } else if (existingOrderDetails) {
      // If order is not shipped but we have details, delete them
      await db.orderDetails.delete({
        where: { id: existingOrderDetails.id }
      });
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Create a new status history entry if the status changed
    if (statusChanged) {
      await db.statusHistory.create({
        data: {
          status: mapStatusToPrisma(status as OrderStatus),
          timestamp: new Date(),
          orderId,
        },
      });
    }

    // Get the updated order with all relations
    const finalOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: true,
        orderDetails: true,
      },
    });

    return NextResponse.json(finalOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request, 
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Validate MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    // Fetch the current order
    const currentOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: true,
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the status has changed
    const statusChanged = 
      currentOrder.statusHistory.length === 0 || 
      currentOrder.statusHistory[currentOrder.statusHistory.length - 1].status !== status;
    
    // Update the order status field
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: mapStatusToPrisma(status as OrderStatus),
      },
    });

    // Create a new status history entry
    if (statusChanged) {
      await db.statusHistory.create({
        data: {
          status: mapStatusToPrisma(status as OrderStatus),
          timestamp: new Date(),
          orderId,
        },
      });
    }

    // Get the updated order with all relations
    const finalOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: true,
        orderDetails: true,
      },
    });

    return NextResponse.json(finalOrder);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status", details: String(error) },
      { status: 500 }
    );
  }
} 