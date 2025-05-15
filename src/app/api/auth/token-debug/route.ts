import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("Token debug API called");
    
    // Get all headers for debugging
    const allHeaders = Object.fromEntries(req.headers.entries());
    console.log("All request headers:", allHeaders);
    
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        error: "No valid authorization header",
        headers: allHeaders
      });
    }
    
    // Extract token
    const token = authHeader.replace("Bearer ", "");
    console.log("Token found:", token.substring(0, 20) + "...");
    
    // Get JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    console.log("Using JWT secret:", JWT_SECRET.substring(0, 3) + "...");
    
    try {
      // Decode without verification first to see payload structure
      const decoded = verify(token, JWT_SECRET, { complete: true });
      console.log("Token decoded successfully");
      
      // Check if the token contains a user ID
      const payload = decoded.payload as any;
      console.log("Token payload:", payload);
      
      if (!payload.id) {
        return NextResponse.json({
          success: false,
          error: "Token doesn't contain user ID",
          payload
        });
      }
      
      // Try to find the user in the database
      try {
        const user = await db.user.findUnique({
          where: { id: payload.id },
          select: { id: true, name: true, email: true }
        });
        
        if (!user) {
          console.log("User not found in database with ID:", payload.id);
          return NextResponse.json({
            success: false,
            error: `User not found with ID: ${payload.id}`,
            tokenInfo: payload
          });
        }
        
        console.log("User found in database:", user);
        
        return NextResponse.json({
          success: true,
          message: "Token is valid and user exists",
          user,
          decodedToken: payload
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json({
          success: false,
          error: "Database error while finding user",
          errorDetails: dbError instanceof Error ? dbError.message : "Unknown error",
          tokenInfo: payload
        });
      }
      
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return NextResponse.json({
        success: false,
        error: "Invalid token",
        errorDetails: verifyError instanceof Error ? verifyError.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Unexpected error in token-debug API:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      errorDetails: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 