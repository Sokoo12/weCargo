// app/api/metrics/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch delivery status counts
    const deliveryStatusData = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Fetch all orders for calculations
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // Start of the current year
          lt: new Date(new Date().getFullYear() + 1, 0, 1), // Start of the next year
        },
      },
      select: {
        createdAt: true,
        deliveryCost: true,
        status: true,
      },
    });

    // Calculate total revenue (sum of deliveryCost)
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.deliveryCost || 0),
      0
    );

    // Count orders by status
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;
    const canceledOrders = orders.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    // Aggregate orders by month
    const monthlySales = Array(12).fill(0); // Initialize an array for 12 months
    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth(); // Get the month (0-11)
      monthlySales[month] += 1; // Increment the count for the corresponding month
    });

    // Format delivery status data for the pie chart
    const formattedDeliveryStatusData = deliveryStatusData.map((item) => ({
      name: item.status,
      value: item._count.status,
    }));

    // Format sales data for the line chart
    const formattedSalesData = monthlySales.map((count, index) => ({
      name: `${index + 1} сар`,
      sales: count,
    }));

    return NextResponse.json({
      deliveryStatus: formattedDeliveryStatusData,
      salesOverview: formattedSalesData,
      totalRevenue,
      deliveredOrders,
      totalOrders,
      canceledOrders,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
