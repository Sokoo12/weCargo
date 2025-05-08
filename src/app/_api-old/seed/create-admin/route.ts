import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // This endpoint should only be accessible in development or through secure means
    if (process.env.NODE_ENV === "production") {
      const authHeader = req.headers.get("authorization");
      const expectedHeader = process.env.ADMIN_SEED_SECRET;
      
      if (!authHeader || authHeader !== expectedHeader) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // Get the admin credentials from the request body
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists", admin: { id: existingAdmin.id, email: existingAdmin.email } },
        { status: 200 }
      );
    }

    // Create a new admin
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
      },
    });

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { message: "Failed to create admin" },
      { status: 500 }
    );
  }
} 