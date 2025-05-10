import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { phoneNumber: string } }
) {
  try {
    const { phoneNumber } = params;
    console.log(`Phone search request for number: ${phoneNumber}`);
    
    // Simple query to get orders by phone number
    const orders = await prisma.order.findMany({
      where: { 
        phoneNumber: phoneNumber 
      },
      include: {
        statusHistory: true,
        orderDetails: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${orders.length} orders for phone number: ${phoneNumber}`);
    
    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No orders found for this phone number" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders by phone number:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders" },
      { status: 500 }
    );
  }
} 