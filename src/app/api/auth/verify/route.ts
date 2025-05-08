import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      console.log("Verify API: No token provided");
      return NextResponse.json(
        { error: "No token provided" },
        { status: 400 }
      );
    }
    
    // Log token details for debugging
    console.log("Verify API - token:", token.substring(0, 10) + "...");
    console.log("Token length:", token.length);
    
    // Basic validation
    if (typeof token !== 'string' || !token.trim()) {
      console.log("Invalid token format: empty or not a string");
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    console.log("Using JWT_SECRET for verification:", JWT_SECRET ? "Set from env" : "Using fallback");
    
    try {
      // Verify the token
      const decoded = verify(token, JWT_SECRET) as { 
        id: string; 
        email: string; 
        role: string; 
        phoneNumber?: string; 
        name?: string;
      };
      
      console.log("Successfully verified token for:", decoded.email);
      
      // Return user data
      return NextResponse.json({
        user: decoded,
        valid: true
      });
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid token", valid: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
} 