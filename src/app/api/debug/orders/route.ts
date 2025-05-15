import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';
import { cookies } from 'next/headers';

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

export async function GET(request: NextRequest) {
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
    
    // Get orders by phone - only if user has a phone number
    let orders: any[] = [];
    let orderStatuses: Record<string, number> = {};
    let orderCount = 0;
    
    if (user.phoneNumber) {
      // Get all orders for this phone number
      orders = await db.order.findMany({
        where: {
          phoneNumber: user.phoneNumber
        },
        include: {
          statusHistory: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      orderCount = orders.length;
      
      // Count order statuses
      orderStatuses = orders.reduce((acc: any, order) => {
        const status = order.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      orderSummary: {
        total: orderCount,
        byStatus: orderStatuses
      },
      orders
    });
  } catch (error) {
    console.error('Debug order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug orders' },
      { status: 500 }
    );
  }
} 