import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// GET: Fetch deliveries approved by admin and not delivered yet
export async function GET(request: NextRequest) {
  try {
    // Get all delivery orders that are in progress
    const deliveries = await db.orderDelivery.findMany({
      where: {
        order: {
          status: {
            in: [OrderStatus.IN_UB, OrderStatus.OUT_FOR_DELIVERY]
          }
        }
      },
      include: {
        order: {
          select: {
            id: true,
            packageId: true,
            phoneNumber: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
} 