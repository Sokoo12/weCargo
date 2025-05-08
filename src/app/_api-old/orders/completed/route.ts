import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get completed orders (delivered or cancelled)
    const orders = await db.order.findMany({
      where: {
        OR: [
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
    console.error('Error fetching completed orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completed orders' },
      { status: 500 }
    );
  }
} 