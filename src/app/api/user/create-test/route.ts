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
    
    // Get data from request
    let phoneNumber = "123456789";
    let password = "test123";
    let email = "test@example.com";
    let name = "Test User";
    
    try {
      const body = await req.json();
      if (body) {
        if (body.phoneNumber) phoneNumber = body.phoneNumber;
        if (body.password) password = body.password;
        if (body.email) email = body.email;
        if (body.name) name = body.name;
      }
    } catch (error) {
      // Use default values if parsing fails
      console.log("Using default test user values");
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
        },
        loginInfo: {
          phoneNumber: existingUser.phoneNumber,
          password: "test123 (default password, unless you specified a different one when creating)"
        }
      });
    }
    
    // Generate a password hash
    const passwordHash = await hash(password, 12);
    
    // Create a test user
    const user = await db.user.create({
      data: {
        name,
        email,
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
      },
      loginInfo: {
        phoneNumber: user.phoneNumber,
        password: password
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