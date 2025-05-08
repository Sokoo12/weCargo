import { NextRequest, NextResponse } from "next/server";
import { signUp } from "@/lib/actions/user.action";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password strength (optional but recommended)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Process sign up
    const result = await signUp({ name, email, phoneNumber, password });

    return NextResponse.json(
      { message: "User created successfully", user: result.user, token: result.token },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during registration" },
      { status: error.message.includes("already exists") ? 409 : 500 }
    );
  }
} 