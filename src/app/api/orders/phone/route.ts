import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RouteParams = {
  params: Promise<{ phoneNumber: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const phoneNumber = (await params).phoneNumber;
    
    // Find orders with matching phone number
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

    // Get the most recent order
    const mostRecentOrder = orders[0];

    // Sort status history by timestamp (oldest first)
    mostRecentOrder.statusHistory.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return NextResponse.json(mostRecentOrder);
  } catch (error) {
    console.error("Failed to fetch order by phone number:", error);
    return NextResponse.json(
      { error: "Failed to fetch order by phone number" },
      { status: 500 }
    );
  }
}