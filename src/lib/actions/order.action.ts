// lib/actions/order.actions.ts
import handleError from "@/utils/handleError";
import { OrderSize, OrderStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CreateOrderParams = {
  orderId: string;
  productId: string;
  phoneNumber?: string;
  size: OrderSize;
  status: OrderStatus;
  note?: string;
  userId: string;
};

export async function createOrder(order: CreateOrderParams) {
  try {
    const newOrder = await prisma.order.create({
      data: {
        orderId: order.orderId,
        productId: order.productId,
        phoneNumber: order.phoneNumber,
        size: order.size,
        status: order.status,
        note: order.note,
        // userId: order.userId,
      },
    });

    return newOrder;
  } catch (error) {
    handleError(error);
  }
}

export async function getOrders() {
  try {
    //   const orders = await prisma.order.findMany({
    //     include: {
    //       user: {
    //         select: {
    //           username: true,
    //           firstName: true,
    //           lastName: true,
    //         },
    //       },
    //     },
    //   });

    const orders = await prisma.order.findMany();

    return orders;
  } catch (error) {
    handleError(error);
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    handleError(error);
  }
}

export async function getOrdersMetrics() {
    try {
      const orders = await prisma.order.findMany({
        select: {
          createdAt: true,
          status: true,
        },
      });
  
      // Group orders by date and status
      const metrics = orders.reduce((acc, order) => {
        const date = order.createdAt.toISOString().split('T')[0]; // Extract date (YYYY-MM-DD)
        if (!acc[date]) {
          acc[date] = {
            PENDING: 0,
            IN_TRANSIT: 0,
            CUSTOMS_HOLD: 0,
            OUT_FOR_DELIVERY: 0,
            DELIVERED: 0,
          };
        }
        acc[date][order.status]++;
        return acc;
      }, {} as Record<string, Record<OrderStatus, number>>);
  
      return metrics;
    } catch (error) {
      handleError(error);
    }
  }

  export async function deleteOrder(orderId: string) {
    try {
      const deletedOrder = await prisma.order.delete({
        where: { orderId },
      });
  
      return deletedOrder;
    } catch (error) {
      handleError(error);
    }
  }


  type UpdateOrderParams = {
    productId?: string;
    phoneNumber?: string;
    size?: OrderSize
    status?: OrderStatus
    note?: string;
    isBroken?: boolean;
  };
  
  export async function updateOrder(orderId: string, order: UpdateOrderParams) {
    try {
      const updatedOrder = await prisma.order.update({
        where: { orderId },
        data: {
          productId: order.productId,
          phoneNumber: order.phoneNumber,
          size: order.size,
          status: order.status,
          note: order.note,
          isBroken: order.isBroken,
        },
      });
  
      return updatedOrder;
    } catch (error) {
      handleError(error);
    }
  }
