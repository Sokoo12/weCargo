import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Get cookies
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth_token");
    
    // Create response with debug info
    const response = {
      hasCookie: !!authCookie,
      cookieValue: authCookie ? {
        length: authCookie.value.length,
        preview: authCookie.value.substring(0, 10) + "...",
        isValidFormat: authCookie.value.includes(".") // Basic JWT check
      } : null,
      environment: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    // If we have a token, try to verify it
    if (authCookie && authCookie.value) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
        const decoded = verify(authCookie.value, JWT_SECRET);
        
        response["tokenVerification"] = {
          success: true,
          decoded: {
            ...decoded,
            // Don't reveal full token content for security
            iat: decoded["iat"],
            exp: decoded["exp"]
          }
        };
      } catch (error) {
        response["tokenVerification"] = {
          success: false,
          error: error.message
        };
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      error: "Debug route error",
      message: error.message
    }, { status: 500 });
  }
} 