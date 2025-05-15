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
    
    console.log("Bypass login API called - looking for existing test users first");
    
    // First try to find an existing test user to reuse
    let user = await db.user.findFirst({
      where: {
        email: { contains: "test" }
      }
    });
    
    if (user) {
      console.log("Found existing test user:", user.id);
    } else {
      // If no test user exists, create one
      console.log("No existing test user found, creating a new one");
      
      // Generate test user data with hardcoded values for easier testing
      const testUser = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        phoneNumber: "99999999", // Consistent phone number for testing
        password: "TestPassword123",
        role: "USER"
      };
      
      // Hash the password
      const passwordHash = await hash(testUser.password, 10);
      
      // Create the user
      try {
        user = await db.user.create({
          data: {
            name: testUser.name,
            email: testUser.email,
            phoneNumber: testUser.phoneNumber,
            passwordHash: passwordHash,
            role: testUser.role,
            isVerified: true
          }
        });
        
        console.log("Created new test user with ID:", user.id);
      } catch (createError) {
        console.error("Error creating test user:", createError);
        return NextResponse.json(
          { 
            success: false, 
            error: "Failed to create test user",
            details: createError instanceof Error ? createError.message : "Unknown error"
          },
          { status: 500 }
        );
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No user available" },
        { status: 500 }
      );
    }
    
    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    
    const token = sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      JWT_SECRET
    );
    
    return NextResponse.json({
      success: true,
      message: "Auto-login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
      token: token,
      note: "Copy and paste this token directly, or use the auto-login redirect",
      htmlRedirect: `
        <html>
          <head>
            <title>Auto Login</title>
            <script>
              localStorage.setItem("userToken", ${JSON.stringify(token)});
              localStorage.setItem("userData", ${JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
              })});
              window.location.href = "/profile";
            </script>
          </head>
          <body>
            <p>Redirecting to profile...</p>
          </body>
        </html>
      `
    });
  } catch (error) {
    console.error("Error in bypass login:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process bypass login",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 