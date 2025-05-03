import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RouteParams = {
  params: Promise<{ number: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const phoneNumber = (await params).number;
    
    // Find all orders with matching phone number
    const orders = await prisma.order.findMany({
      where: { 
        phoneNumber: phoneNumber 
      },
      include: {
        statusHistory: true, // Include status history in the response
      },
      // Order by creation date (newest first)
      orderBy: {
        createdAt: 'desc'
      },
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "No orders found for this phone number" }, { status: 404 });
    }

    // Sort status history by timestamp for each order (oldest first)
    orders.forEach(order => {
      if (order.statusHistory) {
        order.statusHistory.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
    });

    // Return all orders instead of just the most recent one
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders by phone number:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders by phone number" },
      { status: 500 }
    );
  }
}