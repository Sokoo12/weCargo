import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Map status values for backward compatibility
const mapStatus = (status: string | null): OrderStatus | null => {
  if (status === 'PENDING') {
    return 'IN_WAREHOUSE' as OrderStatus;
  }
  
  return status as OrderStatus | null;
};

export async function GET(request: NextRequest) {
  try {
    // Get total count of orders
    const totalOrders = await db.order.count();

    // Get count of warehouse orders (previously pending)
    const warehouseOrders = await db.order.count({
      where: { 
        OR: [
          { status: 'IN_WAREHOUSE' as OrderStatus },
          { status: 'PENDING' as any } // Include both PENDING and IN_WAREHOUSE
        ]
      }
    });

    // Get count of in transit orders
    const inTransitOrders = await db.order.count({
      where: { 
        OR: [
          { status: 'IN_TRANSIT' as OrderStatus },
          { status: 'IN_UB' as OrderStatus },
          { status: 'OUT_FOR_DELIVERY' as OrderStatus },
        ]
      }
    });

    // Get count of delivered orders
    const deliveredOrders = await db.order.count({
      where: { status: 'DELIVERED' as OrderStatus }
    });

    return NextResponse.json({
      totalOrders,
      pendingOrders: warehouseOrders, // Keep the same response structure
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