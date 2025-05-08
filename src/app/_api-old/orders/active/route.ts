import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get active orders (not delivered or cancelled)
    const orders = await db.order.findMany({
      where: {
        NOT: [
          { status: 'DELIVERED' },
          { status: 'CANCELLED' }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active orders' },
      { status: 500 }
    );
  }
} 