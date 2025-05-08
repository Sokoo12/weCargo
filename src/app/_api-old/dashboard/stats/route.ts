import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total count of orders
    const totalOrders = await db.order.count();

    // Get count of pending orders
    const pendingOrders = await db.order.count({
      where: { status: 'IN_WAREHOUSE' }
    });

    // Get count of in transit orders
    const inTransitOrders = await db.order.count({
      where: { 
        OR: [
          { status: 'IN_TRANSIT' },
          { status: 'IN_UB' },
          { status: 'OUT_FOR_DELIVERY' },
        ]
      }
    });

    // Get count of delivered orders
    const deliveredOrders = await db.order.count({
      where: { status: 'DELIVERED' }
    });

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      inTransitOrders,
      deliveredOrders
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 