import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Only enable in development mode
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is disabled in production" },
        { status: 403 }
      );
    }
    
    // Get phone number from request or use a default
    let phoneNumber = "123456789";
    
    try {
      const body = await req.json();
      if (body && body.phoneNumber) {
        phoneNumber = body.phoneNumber;
      }
    } catch (error) {
      // Use default phone number if parsing fails
    }
    
    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { phoneNumber }
    });
    
    if (existingUser) {
      return NextResponse.json({
        message: "Test user already exists",
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phoneNumber: existingUser.phoneNumber,
          role: existingUser.role
        }
      });
    }
    
    // Generate a password hash
    const passwordHash = await hash("test123", 12);
    
    // Create a test user
    const user = await db.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        phoneNumber,
        role: "USER",
        passwordHash
      }
    });
    
    return NextResponse.json({
      message: "Test user created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json(
      { error: "Failed to create test user" },
      { status: 500 }
    );
  }
} 