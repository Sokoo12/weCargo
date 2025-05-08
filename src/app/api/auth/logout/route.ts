import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get cookie store - properly await cookies()
    const cookieStore = await cookies();

    // Clear auth token cookies
    cookieStore.delete("auth_token");
    
    // Log the operation
    console.log("Cleared auth_token cookie during logout");
    
    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to process logout" },
      { status: 500 }
    );
  }
} 