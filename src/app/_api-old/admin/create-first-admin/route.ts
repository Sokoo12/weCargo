import { NextRequest, NextResponse } from "next/server";
import { createAdmin } from "@/lib/actions/admin.action";

export async function POST(req: NextRequest) {
  // This endpoint should be disabled in production
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_ADMIN_CREATION) {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, password, secretKey } = body;

    // Add a simple secret key check as an extra layer of protection
    const expectedSecretKey = process.env.ADMIN_CREATION_KEY || "change-this-in-production";
    if (secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if password is strong enough
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Create the admin
    const admin = await createAdmin(email, password);

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin" },
      { status: 500 }
    );
  }
} 