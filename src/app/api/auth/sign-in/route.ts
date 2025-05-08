import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Try to get the phone number from the request
    let phoneNumber;
    
    try {
      const body = await req.json();
      if (body && body.phoneNumber) {
        phoneNumber = body.phoneNumber;
        console.log("Using phone number from request:", phoneNumber);
      } else {
        // Return an error if no phone number is provided
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    // Find user by phone number
    const user = await db.user.findFirst({
      where: { phoneNumber }
    });
    
    // If no user is found, return an error
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this phone number" },
        { status: 404 }
      );
    }
    
    // Generate a JWT token using the secret
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    console.log("Using JWT secret for signing:", JWT_SECRET ? "Set from env" : "Using fallback");
    
    // Create a token with standard claims
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
    
    console.log("Generated token for user ID:", user.id);
    console.log("Token length:", token.length);
    
    // Create response object
    const response = NextResponse.json(
      { 
        message: "Authentication successful", 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
        },
        token: token, 
        usingCookies: true
      },
      { status: 200 }
    );
    
    // Set the auth token cookie
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    console.log("Set auth_token cookie in sign-in response");
    
    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
} 