import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@/types/enums";

// POST request to create a new delivery request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, address, district, notes } = body;

    if (!orderId || !address || !district) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the order and check if it's eligible for delivery
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Ensure order is in the correct status (IN_UB)
    if (order.status !== OrderStatus.IN_UB) {
      return NextResponse.json(
        { error: "Order is not eligible for delivery at this time" },
        { status: 400 }
      );
    }

    // Create the delivery request
    const deliveryRequest = await prisma.orderDelivery.create({
      data: {
        orderId: orderId,
        address,
        district,
        notes,
      },
    });

    // Update order status to show it's going for delivery
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.OUT_FOR_DELIVERY },
    });

    // Add status history entry
    await prisma.statusHistory.create({
      data: {
        orderId: orderId,
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
    });

    return NextResponse.json(deliveryRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET request to check delivery status by orderId
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const deliveryInfo = await prisma.orderDelivery.findFirst({
      where: { orderId },
    });

    if (!deliveryInfo) {
      return NextResponse.json(
        { error: "No delivery information found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deliveryInfo);
  } catch (error) {
    console.error("Error fetching delivery info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 