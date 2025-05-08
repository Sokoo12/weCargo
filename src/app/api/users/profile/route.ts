import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Extract token from header or cookie - use correct cookie name "auth_token"
    const authHeader = req.headers.get("x-auth-token");
    const token = authHeader || req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Fetch user data from database - remove the 'image' field that doesn't exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order stats if user has a phone number
    let orderStats = {
      totalOrders: 0,
      pendingOrders: 0,
      inTransitOrders: 0,
      deliveredOrders: 0,
    };

    if (user.phoneNumber) {
      try {
        // Fetch orders data
        const orders = await prisma.order.findMany({
          where: { phoneNumber: user.phoneNumber },
          select: {
            id: true,
            status: true,
          },
        });

        // Calculate stats
        orderStats = {
          totalOrders: orders.length,
          pendingOrders: orders.filter(
            (order) => order.status === "IN_WAREHOUSE" || order.status === "PENDING"
          ).length,
          inTransitOrders: orders.filter(
            (order) =>
              order.status === "IN_TRANSIT" || 
              order.status === "IN_UB" || 
              order.status === "OUT_FOR_DELIVERY"
          ).length,
          deliveredOrders: orders.filter(
            (order) => order.status === "DELIVERED"
          ).length,
        };
      } catch (error) {
        console.error("Error fetching order stats:", error);
        // Continue even if order stats fail - we'll return default zeros
      }
    }

    return NextResponse.json({
      user,
      orderStats,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Extract token from header or cookie - use correct cookie name "auth_token"
    const authHeader = req.headers.get("x-auth-token");
    const token = authHeader || req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, email, phoneNumber } = body;

    // Validate inputs
    if (!name && !email && !phoneNumber) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    try {
      // Update user in database - remove the 'image' field
      const updatedUser = await prisma.user.update({
        where: { id: payload.userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
          role: true,
        },
      });

      return NextResponse.json({
        user: updatedUser,
        message: "Profile updated successfully",
      });
    } catch (dbError: any) {
      console.error("Error updating user in database:", dbError);
      
      // Handle unique constraint violations
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          error: `The ${dbError.meta?.target[0] || 'field'} is already in use.`
        }, { status: 409 });
      }
      
      throw dbError; // Rethrow for general error handling
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
} 