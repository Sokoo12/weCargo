import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus, DeliveryStatus } from '@prisma/client';

// GET: Fetch delivery history for a delivery person
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    // Create where clause based on available data in schema
    const whereClause = employeeId 
      ? { 
          order: {
            status: OrderStatus.DELIVERED
          }
        }
      : { 
          order: {
            status: OrderStatus.DELIVERED
          }
        };

    // Get all delivery orders that have been delivered
    const deliveries = await db.orderDelivery.findMany({
      where: whereClause,
      include: {
        order: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery history' },
      { status: 500 }
    );
  }
} 