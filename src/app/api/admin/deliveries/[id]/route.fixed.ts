import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/actions/admin.action";
import { DeliveryStatus, OrderStatus } from "@/types/enums";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    
    // Check if user is admin using the custom authentication
    const token = req.cookies.get("admin_token")?.value;
    const authHeader = req.headers.get("Authorization");
    const headerToken = authHeader ? authHeader.replace("Bearer ", "") : null;
    const tokenToVerify = token || headerToken;
    
    if (!tokenToVerify) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    try {
      // Verify admin token
      await verifyAdminToken(tokenToVerify);
    } catch (verifyError) {
      console.error("Admin token verification error:", verifyError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { deliveryFee, scheduledDate, status, notes } = body;

    // Validate the delivery ID
    const existingDelivery = await prisma.orderDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: true,
      },
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { error: "Delivery request not found" },
        { status: 404 }
      );
    }

    // Update delivery data
    const updateData: any = {};
    
    if (deliveryFee !== undefined) {
      updateData.deliveryFee = deliveryFee;
    }
    
    if (scheduledDate !== undefined) {
      updateData.scheduledDate = scheduledDate;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    if (status !== undefined) {
      updateData.status = status;
      
      // If status is COMPLETED, set completedAt date
      if (status === DeliveryStatus.COMPLETED) {
        updateData.completedAt = new Date();
        
        // Also update the order status to DELIVERED
        await prisma.order.update({
          where: { id: existingDelivery.orderId },
          data: { status: OrderStatus.DELIVERED },
        });
        
        // Add status history entry
        await prisma.statusHistory.create({
          data: {
            orderId: existingDelivery.orderId,
            status: OrderStatus.DELIVERED,
          },
        });
      }
      
      // If status is IN_PROGRESS, update the order status to OUT_FOR_DELIVERY
      if (status === DeliveryStatus.IN_PROGRESS) {
        // Only update if current status is not already OUT_FOR_DELIVERY
        if (existingDelivery.order.status !== OrderStatus.OUT_FOR_DELIVERY) {
          await prisma.order.update({
            where: { id: existingDelivery.orderId },
            data: { status: OrderStatus.OUT_FOR_DELIVERY },
          });
          
          // Add status history entry
          await prisma.statusHistory.create({
            data: {
              orderId: existingDelivery.orderId,
              status: OrderStatus.OUT_FOR_DELIVERY,
            },
          });
        }
      }
    }

    // Update the delivery request
    const updatedDelivery = await prisma.orderDelivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            packageId: true,
            phoneNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 