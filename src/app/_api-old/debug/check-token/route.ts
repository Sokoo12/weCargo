import { NextRequest, NextResponse } from "next/server";
import * as jose from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = req.cookies.get("admin_token")?.value;
    
    // Check if token exists
    if (!adminToken) {
      return NextResponse.json(
        { status: "error", message: "No admin token found in cookies" },
        { status: 400 }
      );
    }
    
    // Try to verify the token with jose
    try {
      const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-for-development";
      const secretKey = new TextEncoder().encode(ADMIN_JWT_SECRET);
      const { payload } = await jose.jwtVerify(adminToken, secretKey);
      
      return NextResponse.json({
        status: "success",
        message: "Admin token is valid",
        tokenInfo: {
          payload,
          expiresAt: new Date((payload.exp as number) * 1000).toISOString(),
        },
        cookieInfo: {
          name: "admin_token",
          value: `${adminToken.substring(0, 10)}...${adminToken.substring(adminToken.length - 10)}`,
          length: adminToken.length,
        }
      });
    } catch (tokenError: any) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Admin token is invalid", 
          error: tokenError.message,
          tokenPreview: adminToken.substring(0, 20) + "..."
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: "Error checking token", error: error.message },
      { status: 500 }
    );
  }
} 