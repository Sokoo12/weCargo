import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/actions/user.action";

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

    // Process sign in
    const result = await signIn({ email, password });

    // Set HTTP-only cookie with the JWT token (optional for added security)
    const response = NextResponse.json(
      { message: "Authentication successful", user: result.user },
      { status: 200 }
    );

    // Set cookie - in production you'd want to use https-only and other security measures
    response.cookies.set({
      name: "auth_token",
      value: result.token,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
} 