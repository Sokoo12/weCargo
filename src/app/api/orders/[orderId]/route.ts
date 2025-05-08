import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { OrderStatus } from "@/types/enums";
import { isValidMongoId, ApiError } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { updateOrderSchema, updateStatusSchema } from "@/lib/validations/order";
import { Order, OrderUpdateData } from "@/types/order";

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

/**
 * Helper function to check if the status has changed
 */
const hasStatusChanged = (
  currentStatusHistory: Array<{ status: string }>, 
  newStatus: string
): boolean => {
  return currentStatusHistory.length === 0 || 
    currentStatusHistory[currentStatusHistory.length - 1].status !== newStatus;
};

export async function GET(
  request: Request, 
  context: { params: { orderId: string } }
) {
  try {
    const { orderId } = context.params;
    
    if (!orderId) {
      throw new ApiError("Order ID is required", 400);
    }
    
    let order = null;
    
    if (isValidMongoId(orderId)) {
      // First try to find by MongoDB ID
      order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          statusHistory: true,
          orderDetails: true,
        },
      });
    }

    // If not found by MongoDB id, try to find by orderId or packageId
    if (!order) {
      const orders = await db.order.findMany({
        where: { 
          OR: [
            { orderId: orderId },
            { packageId: orderId }
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
      throw new ApiError(`No order found with ID, orderId, or packageId matching: ${orderId}`, 404);
    }

    // Sort status history by timestamp (oldest first)
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      order.statusHistory.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    logger.error("Failed to fetch order", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request, 
  context: { params: { orderId: string } }
) {
  try {
    const { orderId } = context.params;
    
    if (!orderId) {
      throw new ApiError("Order ID is required", 400);
    }
    
    if (!isValidMongoId(orderId)) {
      throw new ApiError("Invalid order ID format", 400);
    }

    // Use a transaction to ensure all deletes succeed or fail together
    const result = await db.$transaction(async (tx) => {
      // First, check if order exists
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new ApiError("Order not found", 404);
      }

      // If order is shipped, it might have orderDetails
      if (order.isShipped) {
        await tx.orderDetails.deleteMany({
          where: { orderId: orderId },
        });
      }

      // Delete status history entries
      await tx.statusHistory.deleteMany({
        where: { orderId: orderId },
      });

      // Delete the order
      return await tx.order.delete({
        where: { id: orderId },
      });
    });

    return NextResponse.json({ success: true, deletedOrder: result });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    logger.error("Failed to delete order", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request, 
  context: { params: { orderId: string } }
) {
  try {
    const { orderId } = context.params;
    
    if (!orderId) {
      throw new ApiError("Order ID is required", 400);
    }
    
    if (!isValidMongoId(orderId)) {
      throw new ApiError("Invalid order ID format", 400);
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ApiError(`Invalid request data: ${validationResult.error.message}`, 400);
    }
    
    const validatedData = validationResult.data;
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
    } = validatedData;

    // Use a transaction for all database operations
    const result = await db.$transaction(async (tx) => {
      // Fetch the current order
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          statusHistory: true,
        },
      });

      if (!currentOrder) {
        throw new ApiError("Order not found", 404);
      }

      // Check if status has changed
      const statusChanged = hasStatusChanged(currentOrder.statusHistory, status);
      
      // Get existing orderDetails if any
      let existingOrderDetails = null;
      if (currentOrder.isShipped) {
        existingOrderDetails = await tx.orderDetails.findUnique({
          where: { orderId },
        });
      }

      // Prepare update data
      const updateData: OrderUpdateData = {
        orderId: newOrderId,
        packageId,
        phoneNumber,
        isShipped,
        isDamaged: isDamaged ?? false,
        damageDescription: isDamaged ? damageDescription : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        status: mapStatusToPrisma(status),
      };

      // Update the order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          statusHistory: true,
          orderDetails: true,
        },
      });

      // Handle order details based on isShipped status
      if (isShipped && orderDetails) {
        if (existingOrderDetails) {
          // Update existing order details
          await tx.orderDetails.update({
            where: { id: existingOrderDetails.id },
            data: orderDetails,
          });
        } else {
          // Create new order details
          await tx.orderDetails.create({
            data: {
              orderId,
              ...orderDetails,
            },
          });
        }
      } else if (!isShipped && existingOrderDetails) {
        // If order is not shipped but we have details, delete them
        await tx.orderDetails.delete({
          where: { id: existingOrderDetails.id }
        });
      }

      // Create a new status history entry if the status changed
      if (statusChanged) {
        await tx.statusHistory.create({
          data: {
            status: mapStatusToPrisma(status),
            timestamp: new Date(),
            orderId,
          },
        });
      }

      // Fetch the final order with all relations
      return await tx.order.findUnique({
        where: { id: orderId },
        include: {
          statusHistory: true,
          orderDetails: true,
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    logger.error("Failed to update order", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request, 
  context: { params: { orderId: string } }
) {
  try {
    const { orderId } = context.params;
    
    if (!orderId) {
      throw new ApiError("Order ID is required", 400);
    }
    
    if (!isValidMongoId(orderId)) {
      throw new ApiError("Invalid order ID format", 400);
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ApiError(`Invalid request data: ${validationResult.error.message}`, 400);
    }
    
    const { status } = validationResult.data;

    // Use transaction for database operations
    const result = await db.$transaction(async (tx) => {
      // Fetch the current order
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          statusHistory: true,
        },
      });

      if (!currentOrder) {
        throw new ApiError("Order not found", 404);
      }

      // Check if the status has changed
      const statusChanged = hasStatusChanged(currentOrder.statusHistory, status);
      
      // Update the order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: mapStatusToPrisma(status),
        },
        include: {
          statusHistory: true,
          orderDetails: true,
        },
      });

      // Create a new status history entry if status changed
      if (statusChanged) {
        await tx.statusHistory.create({
          data: {
            status: mapStatusToPrisma(status),
            timestamp: new Date(),
            orderId,
          },
        });
        
        // Re-fetch status history for the response
        updatedOrder.statusHistory = await tx.statusHistory.findMany({
          where: { orderId },
          orderBy: { timestamp: 'asc' },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    logger.error("Failed to update order status", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
} 