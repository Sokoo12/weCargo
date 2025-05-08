import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-change-in-production";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      
      // Connect directly to MongoDB
      const uri = process.env.DATABASE_URL;
      if (!uri) {
        throw new Error("DATABASE_URL not set");
      }

      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("wecargo_db");
      const adminsCollection = db.collection("Admin");

      // Find admin by ID
      const admin = await adminsCollection.findOne({ _id: new ObjectId(decoded.id) });
      
      // Close connection
      await client.close();

      if (!admin) {
        return NextResponse.json(
          { message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        message: "Token valid",
        admin: {
          id: admin._id.toString(),
          email: admin.email,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 