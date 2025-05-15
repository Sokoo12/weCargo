import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { sign } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development mode" },
        { status: 403 }
      );
    }
    
    // Generate test user data
    const testUser = {
      name: "Test User",
      email: `test${Date.now()}@example.com`, // Unique email
      phoneNumber: `9${Math.floor(Math.random() * 10000000)}`, // Random phone number
      password: "Test123!",
      role: "USER"
    };
    
    console.log("Creating test user:", testUser);
    
    // Hash the password
    const passwordHash = await hash(testUser.password, 10);
    
    // Create the user in the database
    const newUser = await db.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        phoneNumber: testUser.phoneNumber,
        passwordHash,
        role: testUser.role,
        isVerified: true
      }
    });
    
    console.log("Test user created with ID:", newUser.id);
    
    // Generate a JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    
    const token = sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      JWT_SECRET
    );
    
    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role
      },
      credentials: {
        phoneNumber: testUser.phoneNumber,
        password: testUser.password
      },
      token
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create test user",
        errorDetails: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 