import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderSize, OrderStatus } from "@/types/enums";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body: OrderBody = await request.json();

    console.log(body);
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

    // Create a new order with initial status history
    const newOrder = await prisma.order.create({
      data: {
        packageId,
        productId,
        phoneNumber,
        size,
        status,
        note,
        isBroken: isBroken ?? false, // Ensure default value
        deliveryAddress,
        deliveryCost,
        isPaid,
        createdAt: createdAt,
        statusHistory: {
          create: {
            status,
            timestamp: new Date(),
          },
        },
      },
      include: {
        statusHistory: true, // Include status history in response
      },
    });

    const response: Order = {
      id: newOrder.id,
      packageId: newOrder.packageId,
      productId: newOrder.productId,
      phoneNumber: newOrder.phoneNumber,
      size: newOrder.size as OrderSize,
      status: newOrder.status as OrderStatus,
      statusHistory: newOrder.statusHistory.map((history) => ({
        id: history.id,
        status: history.status as OrderStatus,
        timestamp: history.timestamp,
        orderId: history.orderId,
      })),
      createdAt: newOrder.createdAt,
      note: newOrder.note,
      isBroken: newOrder.isBroken,
      deliveryAddress: newOrder.deliveryAddress,
      deliveryCost: newOrder.deliveryCost,
      isPaid: newOrder.isPaid,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        statusHistory: true, // Include status history in response
      },
    });

    const response: Order[] = orders.map((order) => ({
      id: order.id,
      packageId: order.packageId,
      productId: order.productId,
      phoneNumber: order.phoneNumber,
      size: order.size as OrderSize,
      status: order.status as OrderStatus,
      statusHistory: order.statusHistory.map((history) => ({
        id: history.id,
        status: history.status as OrderStatus,
        timestamp: history.timestamp,
        orderId: history.orderId,
      })),
      createdAt: order.createdAt,
      note: order.note,
      isBroken: order.isBroken,
      deliveryAddress: order.deliveryAddress,
      deliveryCost: order.deliveryCost,
      isPaid: order.isPaid,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
