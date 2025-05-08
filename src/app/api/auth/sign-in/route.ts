import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Get the phone number and password from the request
    let phoneNumber, password;
    
    try {
      const body = await req.json();
      if (body) {
        phoneNumber = body.phoneNumber;
        password = body.password;
      }
      
      // Return an error if no phone number is provided
      if (!phoneNumber) {
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: 400 }
        );
      }
      
      // Return an error if no password is provided
      if (!password) {
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    // Find user by phone number
    const user = await db.user.findFirst({
      where: { phoneNumber }
    });
    
    // If no user is found, return an error
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this phone number" },
        { status: 404 }
      );
    }
    
    // Verify the password
    try {
      // Check if the password matches
      const passwordMatches = await compare(password, user.passwordHash);
      
      if (!passwordMatches) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 401 }
        );
      }
    } catch (passwordError) {
      console.error("Error verifying password:", passwordError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }
    
    // Generate a JWT token using the secret
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    
    // Create a token with standard claims
    const token = sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      }, 
      JWT_SECRET
    );
    
    // Return the token and user data, no cookies
    return NextResponse.json(
      { 
        token,
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          role: user.role || "USER"
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "An error occurred during authentication" },
      { status: 500 }
    );
  }
} 