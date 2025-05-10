import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// PUT: Update delivery status 
export async function PUT(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const deliveryId = params.deliveryId;
    const body = await request.json();
    const { status, note } = body;

    // Validate the delivery ID
    const delivery = await db.orderDelivery.findUnique({
      where: { id: deliveryId },
      include: { order: true }
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    // Update the order status instead of the delivery
    const updated = await db.order.update({
      where: { id: delivery.orderId },
      data: { 
        status
      }
    });

    // Add status history entry
    await db.statusHistory.create({
      data: {
        orderId: delivery.orderId,
        status
      }
    });

    // Update notes if provided
    if (note) {
      await db.orderDelivery.update({
        where: { id: deliveryId },
        data: {
          notes: note ? `${delivery.notes || ''}\n${note}` : delivery.notes
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
} 