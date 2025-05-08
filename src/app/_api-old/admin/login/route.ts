import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect directly to MongoDB
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error("DATABASE_URL not set");
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("wecargo_db");
    const adminsCollection = db.collection("Admin");

    // Find admin by email
    const admin = await adminsCollection.findOne({ email });
    
    // Close connection
    await client.close();

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if admin has plain password or hashed password
    if (admin.passwordHash) {
      // Compare hashed passwords
      const passwordValid = await bcrypt.compare(password, admin.passwordHash);
      
      if (!passwordValid) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }
    } else if (admin.password) {
      // Direct comparison for plain text password (from MongoDB)
      if (password !== admin.password) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Admin account is not properly configured" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id.toString(), 
        email: admin.email, 
        role: "ADMIN" 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 