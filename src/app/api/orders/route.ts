import { NextResponse } from "next/server";
import { db, prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { OrderStatus as AppOrderStatus } from "@/types/enums";

// Map application enum values to Prisma enum values
const mapStatusToPrisma = (status: AppOrderStatus | string): OrderStatus => {
  // Both enums have matching values but TypeScript needs explicit mapping
  // Also handle PENDING for backward compatibility
  if (status === 'PENDING') {
    return 'IN_WAREHOUSE' as OrderStatus;
  }

  switch(status as AppOrderStatus) {
    case AppOrderStatus.IN_WAREHOUSE:
      return 'IN_WAREHOUSE' as OrderStatus;
    case AppOrderStatus.IN_TRANSIT:
      return 'IN_TRANSIT' as OrderStatus;
    case AppOrderStatus.IN_UB:
      return 'IN_UB' as OrderStatus;
    case AppOrderStatus.OUT_FOR_DELIVERY:
      return 'OUT_FOR_DELIVERY' as OrderStatus;
    case AppOrderStatus.DELIVERED:
      return 'DELIVERED' as OrderStatus;
    case AppOrderStatus.CANCELLED:
      return 'CANCELLED' as OrderStatus;
    default:
      return 'IN_WAREHOUSE' as OrderStatus;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      orderId,
      packageId,
      phoneNumber,
      isShipped,
      isDamaged,
      damageDescription,
      status,
      orderDetails,
      createdAt,
    } = body;

    // Validate status to ensure it's a valid OrderStatus enum value
    const validStatus = Object.values(AppOrderStatus).includes(status as AppOrderStatus) 
      ? status as AppOrderStatus 
      : AppOrderStatus.IN_WAREHOUSE; // Default to IN_WAREHOUSE if invalid

    // Create a new order with initial status history
    const orderData: any = {
      orderId,
      packageId,
      phoneNumber,
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
    const newOrder = await db.order.create({
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

export async function GET() {
  try {
    // Fetch all orders with status history
    const orders = await db.order.findMany({
      include: {
        statusHistory: true,
        orderDetails: true
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    // Map any invalid status values to IN_WAREHOUSE for client-side safety
    const sanitizedOrders = orders.map(order => ({
      ...order,
      // Handle status conversion safely
      status: !order.status ? 
        mapStatusToPrisma(AppOrderStatus.IN_WAREHOUSE) :
        (Object.values(AppOrderStatus).includes(order.status as any) 
          ? order.status 
          : mapStatusToPrisma(AppOrderStatus.IN_WAREHOUSE)),
      statusHistory: order.statusHistory.map(history => ({
        ...history,
        // Handle status history conversion safely
        status: Object.values(AppOrderStatus).includes(history.status as any)
          ? history.status
          : mapStatusToPrisma(AppOrderStatus.IN_WAREHOUSE)
      }))
    }));

    return NextResponse.json(sanitizedOrders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: String(error) },
      { status: 500 }
    );
  }
} 