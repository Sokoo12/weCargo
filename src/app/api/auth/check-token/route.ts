import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    console.log("Check token API called");
    
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        error: "No authorization token provided",
        headers: Object.fromEntries(req.headers.entries())
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted:", token.substring(0, 20) + "...");
    
    // Verify token
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
      const decoded = verify(token, JWT_SECRET);
      
      return NextResponse.json({
        success: true,
        message: "Token is valid",
        decodedToken: decoded
      });
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return NextResponse.json({
        success: false,
        error: "Invalid token",
        errorDetails: verifyError instanceof Error ? verifyError.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Error in check-token API:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      errorDetails: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 