import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Get the cookie token - properly await cookies()
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth_token");
    
    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }
    
    const token = authCookie.value;
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    
    try {
      // Verify the token from cookie
      const decoded = verify(token, JWT_SECRET) as { 
        id: string; 
        email: string; 
        role: string; 
        phoneNumber?: string; 
        name?: string;
      };
      
      // Return user data from verified token
      return NextResponse.json({
        user: decoded,
        valid: true
      });
    } catch (error) {
      console.error("Cookie token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid session", valid: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
} 