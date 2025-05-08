import { NextRequest, NextResponse } from "next/server";
import { createAdmin } from "@/lib/actions/admin.action";

export async function POST(req: NextRequest) {
  try {
    // This endpoint should only be used in development or with proper security
    // You might want to restrict this or use environment variables for production
    const { email, password, secretKey } = await req.json();

    // Basic validation for required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Secret key check - replace with your own secure secret in production
    const expectedSecretKey = process.env.ADMIN_CREATION_SECRET_KEY || "your-super-secure-secret-key";
    if (secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await createAdmin({ email, password });

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
      }
    });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 