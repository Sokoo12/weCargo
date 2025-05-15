import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';
import { OrderStatus } from '@prisma/client';

// Helper to get user from Authorization header
const getUserFromAuthHeader = async (request: NextRequest) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  
  const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload as { id: string; email: string; role: string; name?: string };
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const userData = await getUserFromAuthHeader(request);
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user details
    const user = await db.user.findUnique({
      where: { id: userData.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.phoneNumber) {
      return NextResponse.json(
        { error: 'User has no phone number' },
        { status: 400 }
      );
    }
    
    // Create test orders with different statuses
    const statuses = [
      OrderStatus.IN_WAREHOUSE, 
      OrderStatus.IN_TRANSIT, 
      OrderStatus.IN_UB, 
      OrderStatus.OUT_FOR_DELIVERY, 
      OrderStatus.DELIVERED
    ];
    const createdOrders = [];
    
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const packageId = `TEST-${Date.now()}-${i}`;
      
      // Create order
      const order = await db.order.create({
        data: {
          packageId,
          orderId: `ORD-${Date.now()}-${i}`,
          phoneNumber: user.phoneNumber,
          status,
          createdAt: new Date(),
          statusHistory: {
            create: {
              status,
              timestamp: new Date()
            }
          }
        }
      });
      
      createdOrders.push(order);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test orders created successfully',
      count: createdOrders.length,
      orders: createdOrders
    });
  } catch (error) {
    console.error('Error creating test orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test orders',
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 