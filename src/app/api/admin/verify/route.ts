import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/actions/admin.action";

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies first
    const token = req.cookies.get("admin_token")?.value;
    
    // If not in cookies, check Authorization header (for client-side verification)
    const authHeader = req.headers.get("Authorization");
    const headerToken = authHeader ? authHeader.replace("Bearer ", "") : null;
    
    // Use cookie token or header token
    const tokenToVerify = token || headerToken;
    
    if (!tokenToVerify) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }
    
    try {
      // Verify the token
      const payload = await verifyAdminToken(tokenToVerify);
      
      // Return admin info from payload
      return NextResponse.json({
        message: "Token is valid",
        admin: {
          id: payload.id,
          email: payload.email,
        }
      });
    } catch (verifyError) {
      console.error("Admin token verification error:", verifyError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Admin verify endpoint error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
} 