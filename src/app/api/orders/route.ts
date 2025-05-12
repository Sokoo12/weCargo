import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderStatus } from "@/types/enums";
import { db } from "@/lib/db";
import { isValidMongoId, ApiError } from "@/lib/utils";
import { logger } from "@/lib/logger";

// Set the runtime configuration for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Create a new PrismaClient instance if needed
const prisma = new PrismaClient();

// Map application enum values to Prisma enum values
const mapStatusToPrisma = (status: OrderStatus | string): string => {
  // Both enums have matching values but TypeScript needs explicit mapping
  // Also handle PENDING for backward compatibility
  if (status === 'PENDING') {
    return 'IN_WAREHOUSE';
  }

  switch(status as OrderStatus) {
    case OrderStatus.IN_WAREHOUSE:
      return 'IN_WAREHOUSE';
    case OrderStatus.IN_TRANSIT:
      return 'IN_TRANSIT';
    case OrderStatus.IN_UB:
      return 'IN_UB';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'OUT_FOR_DELIVERY';
    case OrderStatus.DELIVERED:
      return 'DELIVERED';
    case OrderStatus.CANCELLED:
      return 'CANCELLED';
    default:
      return 'IN_WAREHOUSE';
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      orderId,
      packageId,
      phoneNumber,
      size,
      packageSize,
      isShipped,
      isDamaged,
      damageDescription,
      status,
      orderDetails,
      createdAt,
    } = body;

    // Validate status to ensure it's a valid OrderStatus enum value
    const validStatus = Object.values(OrderStatus).includes(status as OrderStatus) 
      ? status as OrderStatus 
      : OrderStatus.IN_WAREHOUSE; // Default to IN_WAREHOUSE if invalid

    // Create a new order with initial status history
    const orderData: any = {
      orderId,
      packageId,
      phoneNumber,
      size,
      package_size: packageSize,
      isShipped: isShipped ?? false,
      isDamaged: isDamaged ?? false,
      damageDescription: isDamaged ? damageDescription : undefined,
      createdAt: createdAt || new Date(),
      status: mapStatusToPrisma(validStatus), // Set the status field directly
      statusHistory: {
        create: {
          status: mapStatusToPrisma(validStatus),
          timestamp: new Date(),
        },
      },
    };

    // Only create order details if isShipped is true and orderDetails is provided
    if (isShipped && orderDetails) {
      Object.assign(orderData, {
        orderDetails: {
          create: {
            totalQuantity: orderDetails.totalQuantity,
            shippedQuantity: orderDetails.shippedQuantity,
            largeItemQuantity: orderDetails.largeItemQuantity,
            smallItemQuantity: orderDetails.smallItemQuantity,
            priceRMB: orderDetails.priceRMB,
            priceTonggur: orderDetails.priceTonggur,
            deliveryAvailable: orderDetails.deliveryAvailable,
            comments: orderDetails.comments,
          }
        }
      });
    }

    // Create the order
    const newOrder = await prisma.order.create({
      data: orderData,
      include: {
        statusHistory: true,
        orderDetails: true,
      },
    });

    // Just return the newly created order
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const phoneNumber = searchParams.get('phoneNumber');
    const isAdmin = searchParams.get('admin') === 'true';
    const isManager = searchParams.get('manager') === 'true';

    // If this is an admin request, return all orders
    if (isAdmin) {
      logger.info('Admin request: Fetching all orders');
      
      // Check for pagination parameters
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '100');
      const skip = (page - 1) * limit;

      // Check for filter parameters
      const status = searchParams.get('status');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');

      // Build filter conditions
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom);
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          where.createdAt.lte = toDate;
        }
      }
      
      // Count total matching records for pagination info
      const totalCount = await db.order.count({ where });
      
      // Fetch orders with pagination and filtering
      const orders = await db.order.findMany({
        where,
        include: {
          statusHistory: true,
          orderDetails: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });
      
      logger.info(`Found ${orders.length} orders for admin request (total: ${totalCount})`);
      
      // Sort status history for each order
      orders.forEach(order => {
        if (order.statusHistory && Array.isArray(order.statusHistory)) {
          order.statusHistory.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
      });
      
      // Return orders with pagination metadata
      return NextResponse.json({
        orders,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    }

    // If this is a manager request, return all orders for manager view
    if (isManager) {
      logger.info('Manager request: Fetching all orders for manager view');
      
      const orders = await db.order.findMany({
        include: {
          statusHistory: true,
          orderDetails: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      logger.info(`Found ${orders.length} orders for manager request`);
      
      // Sort status history for each order
      orders.forEach(order => {
        if (order.statusHistory && Array.isArray(order.statusHistory)) {
          order.statusHistory.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
      });
      
      return NextResponse.json(orders);
    }

    // Check that at least one search parameter is provided
    if (!orderId && !phoneNumber) {
      return NextResponse.json(
        { error: "Either orderId or phoneNumber must be provided" },
        { status: 400 }
      );
    }

    // Search by order ID
    if (orderId) {
      logger.info(`Searching for order by ID: ${orderId}`);
      
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
        return NextResponse.json(
          { error: `No order found with ID, orderId, or packageId matching: ${orderId}` },
          { status: 404 }
        );
      }

      // Sort status history by timestamp (oldest first)
      if (order.statusHistory && Array.isArray(order.statusHistory)) {
        order.statusHistory.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }

      return NextResponse.json(order);
    }
    
    // Search by phone number
    if (phoneNumber) {
      logger.info(`Searching for orders by phone number: ${phoneNumber}`);
      
      const orders = await db.order.findMany({
        where: { 
          phoneNumber: phoneNumber 
        },
        include: {
          statusHistory: true,
          orderDetails: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      logger.info(`Found ${orders.length} orders for phone number: ${phoneNumber}`);
      
      if (orders.length === 0) {
        return NextResponse.json(
          { error: "No orders found for this phone number" },
          { status: 404 }
        );
      }
      
      // Sort status history for each order
      orders.forEach(order => {
        if (order.statusHistory && Array.isArray(order.statusHistory)) {
          order.statusHistory.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
      });
      
      return NextResponse.json(orders);
    }
    
  } catch (error) {
    logger.error("Error searching for orders:", error);
    return NextResponse.json(
      { error: "Failed to search for orders" },
      { status: 500 }
    );
  }
} 