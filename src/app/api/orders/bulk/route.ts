import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderSize, OrderStatus } from "@/types/enums";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body: OrderBody[] = await request.json(); // Expect an array of orders

    console.log("bodyy: ==:>", body);

    // Validate the input
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Алдаа: Захиалгын мэдээлэл буруу байна." },
        { status: 400 }
      );
    }

    // // Check for duplicate packageIds in the request
    // const packageIds = body.map((order) => order.packageId);

    // // Check for existing packageIds in the database
    // const existingOrders = await prisma.order.findMany({
    //   where: {
    //     packageId: {
    //       in: packageIds,
    //     },
    //   },
    //   select: {
    //     packageId: true,
    //   },
    // });

    // if (existingOrders.length > 0) {
    //   const existingPackageIds = existingOrders.map((order) => order.packageId);
    //   return NextResponse.json(
    //     {
    //       error: "Зарим захиалгын дугаар өмнө бүртгэгдсэн байна.",
    //       existingPackageIds,
    //     },
    //     { status: 400 }
    //   );
    // }

    // data: {
    //   packageId,
    //   productId,
    //   phoneNumber,
    //   size,
    //   status,
    //   note,
    //   userId,
    //   isBroken: isBroken ?? false, // Ensure default value
    //   deliveryAddress,
    //   deliveryCost,
    //   isPaid,
    //   statusHistory: {
    //     create: {
    //       status,
    //       timestamp: new Date(),
    //     },
    //   },
    // },
    // include: {
    //   statusHistory: true, // Include status history in response
    // },

    // Create multiple orders with their status history
    await prisma.$transaction(
      body.map((order) =>
        prisma.order.create({
          data: {
            packageId: String(order.packageId),
            productId: String(order.productId),
            phoneNumber: order.phoneNumber,
            size: order.size,
            status: order.status,
            note: order.note,
            // userId: order.userId,
            isBroken: order.isBroken ?? false, // Ensure default value
            deliveryAddress: order.deliveryAddress,
            deliveryCost: order.deliveryCost,
            isPaid: order.isPaid,
            createdAt: order.createdAt,
            statusHistory: {
              create: {
                status: order.status,
                timestamp: new Date(),
              },
            },
          },
          include: {
            statusHistory: true, // Include status history in response
          },
        })
      )
    );

    // // Map the response to the Order type
    // createdOrders.map((newOrder) => ({
    //   id: newOrder.id,
    //   packageId: newOrder.packageId,
    //   productId: newOrder.productId,
    //   phoneNumber: newOrder.phoneNumber,
    //   size: newOrder.size as OrderSize,
    //   status: newOrder.status as OrderStatus,
    //   statusHistory: newOrder.statusHistory.map((history) => ({
    //     id: history.id,
    //     status: history.status as OrderStatus,
    //     timestamp: history.timestamp,
    //     orderId: history.orderId,
    //   })),
    //   createdAt: newOrder.createdAt,
    //   note: newOrder.note,
    //   isBroken: newOrder.isBroken,
    //   userId: newOrder.userId,
    //   deliveryAddress: newOrder.deliveryAddress,
    //   deliveryCost: newOrder.deliveryCost,
    //   isPaid: newOrder.isPaid,
    // }));

    return NextResponse.json({ status: 201 });
  } catch (error) {
    console.log("Failed to create orders:", error);
    return NextResponse.json(
      { error: "Захиалга үүсгэхэд алдаа гарлаа." },
      { status: 500 }
    );
  }
}
