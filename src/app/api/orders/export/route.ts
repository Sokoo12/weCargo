import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { OrderStatus, OrderSize } from "@/types/enums";

export async function GET(request: Request) {
  try {
    // Parse URL to get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    console.log(`Fetching orders from ${startDate} to ${endDate}`);

    // Calculate the end of the end date (23:59:59.999)
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // Set to end of day

    console.log(`Adjusted date range: ${startDateTime.toISOString()} to ${endDateTime.toISOString()}`);

    // Fetch orders within the date range
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      include: {
        statusHistory: true,
        orderDetails: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${orders.length} orders`);
    
    if (orders.length === 0) {
      // If no orders found in the date range, return an empty array
      console.log("No orders found in the date range");
      return NextResponse.json([]);
    }

    // Transform Prisma objects to JSON-serializable data with expected structure
    const formattedOrders = orders.map(order => {
      console.log("Formatting order:", order.packageId, "Status:", order.status);
      
      // Create a formatted order object matching the expected structure
      return {
        id: order.id,
        packageId: order.packageId || "",
        phoneNumber: order.phoneNumber || "",
        size: order.size || "UNDEFINED",
        status: order.status || "IN_WAREHOUSE",
        statusHistory: order.statusHistory.map(history => ({
          id: history.id,
          status: history.status,
          timestamp: history.timestamp,
          orderId: history.orderId,
        })),
        createdAt: order.createdAt,
        note: "", // Not present in the schema
        isBroken: order.isDamaged || false,
        deliveryAddress: "", // Not present in the schema
        deliveryCost: order.deliveryCost || 0,
        isPaid: false, // Not present in the schema
        orderDetails: order.orderDetails ? {
          totalQuantity: order.orderDetails.totalQuantity,
          shippedQuantity: order.orderDetails.shippedQuantity,
          largeItemQuantity: order.orderDetails.largeItemQuantity,
          smallItemQuantity: order.orderDetails.smallItemQuantity,
          priceRMB: order.orderDetails.priceRMB,
          priceTonggur: order.orderDetails.priceTonggur,
          deliveryAvailable: order.orderDetails.deliveryAvailable,
          comments: order.orderDetails.comments || "",
        } : null,
      };
    });

    console.log(`Returning ${formattedOrders.length} formatted orders`);
    
    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Failed to export orders:", error);
    return NextResponse.json(
      { error: "Failed to export orders", details: String(error) },
      { status: 500 }
    );
  }
} 