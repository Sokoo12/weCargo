import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { OrderStatus } from "@/types/enums";

// Map application enum values to Prisma enum values
const mapStatusToPrisma = (status: OrderStatus): PrismaOrderStatus => {
  // Both enums have matching values but TypeScript needs explicit mapping
  switch(status) {
    case OrderStatus.IN_WAREHOUSE:
      return 'IN_WAREHOUSE' as PrismaOrderStatus;
    case OrderStatus.IN_TRANSIT:
      return 'IN_TRANSIT' as PrismaOrderStatus;
    case OrderStatus.IN_UB:
      return 'IN_UB' as PrismaOrderStatus;
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'OUT_FOR_DELIVERY' as PrismaOrderStatus;
    case OrderStatus.DELIVERED:
      return 'DELIVERED' as PrismaOrderStatus;
    case OrderStatus.CANCELLED:
      return 'CANCELLED' as PrismaOrderStatus;
    default:
      return 'IN_WAREHOUSE' as PrismaOrderStatus;
  }
};

interface OrderBody {
  orderId: string;
  packageId: string;
  phoneNumber?: string;
  isShipped: boolean;
  isDamaged: boolean;
  damageDescription?: string;
  status: OrderStatus;
  createdAt: Date;
  orderDetails?: {
    totalQuantity: number;
    shippedQuantity: number;
    largeItemQuantity: number;
    smallItemQuantity: number;
    priceRMB: number;
    priceTonggur: number;
    deliveryAvailable: boolean;
    comments?: string;
  };
}

export async function POST(request: Request) {
  try {
    const orders: OrderBody[] = await request.json();

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "No valid orders provided" },
        { status: 400 }
      );
    }

    console.log(`Processing ${orders.length} orders for bulk import`);

    // Check for duplicate packageIds
    const packageIds = orders.map(order => order.packageId);
    const uniquePackageIds = new Set(packageIds);
    
    if (uniquePackageIds.size !== packageIds.length) {
      return NextResponse.json(
        { error: "Duplicate package IDs found in import data" },
        { status: 400 }
      );
    }

    // Check if any packageIds already exist in the database
    const existingPackages = await db.order.findMany({
      where: {
        packageId: {
          in: packageIds.map(id => String(id))
        }
      },
      select: { packageId: true }
    });

    if (existingPackages.length > 0) {
      const existingIds = existingPackages.map(p => p.packageId).join(", ");
      return NextResponse.json(
        { error: `These package IDs already exist: ${existingIds}` },
        { status: 400 }
      );
    }

    // Create orders in a transaction
    const createdOrders = await db.$transaction(
      orders.map((orderData) => {
        const validStatus = mapStatusToPrisma(orderData.status);
        
        const orderCreateData: any = {
          orderId: String(orderData.orderId),
          packageId: String(orderData.packageId),
          phoneNumber: orderData.phoneNumber ? String(orderData.phoneNumber) : undefined,
          isShipped: orderData.isShipped,
          isDamaged: orderData.isDamaged || false,
          damageDescription: orderData.isDamaged ? orderData.damageDescription : undefined,
          createdAt: orderData.createdAt || new Date(),
          status: validStatus,
          statusHistory: {
            create: {
              status: validStatus,
              timestamp: new Date(),
            },
          },
        };

        // Only create order details if isShipped is true and orderDetails is provided
        if (orderData.isShipped && orderData.orderDetails) {
          Object.assign(orderCreateData, {
            orderDetails: {
              create: {
                totalQuantity: orderData.orderDetails.totalQuantity,
                shippedQuantity: orderData.orderDetails.shippedQuantity,
                largeItemQuantity: orderData.orderDetails.largeItemQuantity,
                smallItemQuantity: orderData.orderDetails.smallItemQuantity,
                priceRMB: orderData.orderDetails.priceRMB,
                priceTonggur: orderData.orderDetails.priceTonggur,
                deliveryAvailable: orderData.orderDetails.deliveryAvailable,
                comments: orderData.orderDetails.comments,
              }
            }
          });
        }

        return db.order.create({
          data: orderCreateData,
          include: {
            statusHistory: true,
            orderDetails: true,
          },
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      count: createdOrders.length, 
      orders: createdOrders.map(o => o.orderId) 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bulk orders:", error);
    return NextResponse.json(
      { error: `Failed to create bulk orders: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 