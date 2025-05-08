import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Ensure params.orderId is handled properly
    const orderId = params.orderId;

    // Find the order's status history with employee info
    const statusHistory = await db.statusHistory.findMany({
      where: { orderId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    if (!statusHistory || statusHistory.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(statusHistory);
  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order history' },
      { status: 500 }
    );
  }
} 