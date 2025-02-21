import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { packageId: params.orderId },
      include: {
        statusHistory: true, // Include status history in the response
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Sort status history by timestamp (oldest first)
    order.statusHistory.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  // console.log("delete order id===>",params.orderId)
  try {
    const { orderId } = params;

    // First, delete status history entries
    await prisma.statusHistory.deleteMany({
      where: { orderId: orderId },
    });

    // Then, delete the order. orderId is acually id of object
    await prisma.order.delete({
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

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const {
      packageId,
      productId,
      phoneNumber,
      size,
      status,
      note,
      isBroken,
      deliveryAddress,
      deliveryCost,
      isPaid,
      createdAt,
    }: OrderBody = body;

    console.log("Updating order:", body);

    // Fetch the current order with status history
    const currentOrder = await prisma.order.findUnique({
      where: { packageId: params.orderId },
      include: {
        statusHistory: true, // Fetch all status history records
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Find if the status already exists in history
    const existingStatus = currentOrder.statusHistory.find(
      (s) => s.status === status
    );

    console.log("existing status", existingStatus);

    let statusHistoryUpdate = {};
    if (existingStatus) {
      // Update timestamp if the status already exists
      statusHistoryUpdate = {
        update: {
          where: { id: existingStatus.id },
          data: { timestamp: new Date() },
        },
      };
    } else {
      // Create new entry only if this status is missing
      statusHistoryUpdate = {
        create: {
          status,
          timestamp: new Date(),
        },
      };
    }

    // Update the order
    await prisma.order.update({
      where: { packageId: params.orderId },
      data: {
        packageId,
        productId,
        phoneNumber,
        size,
        status,
        note,
        isBroken,
        deliveryAddress,
        deliveryCost,
        isPaid,
        statusHistory: statusHistoryUpdate, // Ensure only 6 status entries exist
        createdAt: createdAt,
      },
      include: {
        statusHistory: true, // Include updated status history in response
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
