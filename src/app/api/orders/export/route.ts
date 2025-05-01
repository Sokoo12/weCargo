// app/api/orders/export/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderSize, OrderStatus } from "@/types/enums";

const prisma = new PrismaClient();

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

    // Fetch orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        statusHistory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform Prisma objects to JSON-serializable data
    const formattedOrders = orders.map(order => ({
      id: order.id,
      packageId: order.packageId,
      productId: order.productId,
      phoneNumber: order.phoneNumber,
      size: order.size as OrderSize,
      status: order.status as OrderStatus,
      statusHistory: order.statusHistory.map(history => ({
        id: history.id,
        status: history.status,
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

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Failed to export orders:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}