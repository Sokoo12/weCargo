import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/lib/actions/user.action";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Process forgot password request
    const result = await forgotPassword(email);

    // In a real application, you would send an email with the reset link here
    // For now, we'll just return a success message

    return NextResponse.json(
      { 
        message: "If an account with that email exists, a password reset link has been sent",
        // Only include token in development (for testing purposes)
        ...(process.env.NODE_ENV !== "production" && { resetToken: result.resetToken }) 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
} 