import { NextRequest, NextResponse } from "next/server";
import { adminSignIn } from "@/lib/actions/admin.action";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log(`Admin sign-in attempt for: ${email}`);

    try {
      // Process admin sign in
      const result = await adminSignIn({ email, password });

      // Set HTTP-only cookie with the JWT token for admin
      const response = NextResponse.json(
        { message: "Admin authentication successful", admin: result.admin },
        { status: 200 }
      );

      // Set admin cookie
      response.cookies.set({
        name: "admin_token",
        value: result.token,
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        // secure: process.env.NODE_ENV === "production",
      });

      return response;
    } catch (authError: any) {
      console.error("Admin authentication error:", authError);
      return NextResponse.json(
        { 
          error: authError.message || "Authentication failed",
          details: process.env.NODE_ENV === 'development' ? authError.toString() : undefined 
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Admin sign-in request error:", error);
    return NextResponse.json(
      { 
        error: "Invalid request format",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined 
      },
      { status: 400 }
    );
  }
} 