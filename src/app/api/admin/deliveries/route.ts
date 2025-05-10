import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/actions/admin.action";

// GET all delivery requests
export async function GET(req: NextRequest) {
  try {
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

    // Fetch all delivery requests with related order information
    const deliveries = await prisma.orderDelivery.findMany({
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
      orderBy: {
        requestedAt: "desc",
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 