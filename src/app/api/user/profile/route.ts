import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';
import { ObjectId } from 'mongodb';

// Helper to extract and verify token from Authorization header
const getUserFromAuthHeader = async (request: NextRequest) => {
  try {
    // Check Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      console.log("No Authorization header found");
      return null;
    }
    
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.log("No token found in Authorization header");
      return null;
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    
    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      console.log("Auth header token verified successfully");
      return payload as { id: string; email: string; role: string; name?: string };
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return null;
    }
  } catch (error) {
    console.error("Error verifying auth header token:", error);
    return null;
  }
};

// Get user from cookies
const getUserFromCookie = async (request: NextRequest) => {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log("No token found in cookies");
      return null;
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    
    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      console.log("Cookie token verified successfully");
      return payload as { id: string; email: string; role: string; name?: string };
    } catch (jwtError) {
      console.error("JWT verification error (cookie):", jwtError);
      return null;
    }
  } catch (error) {
    console.error("Error verifying cookie token:", error);
    return null;
  }
};

// Check if a string is a valid MongoDB ObjectID
const isValidObjectId = (id: string): boolean => {
  if (!id) return false;
  
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch (error) {
    console.error("Error validating ObjectId:", error);
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log("Profile API called");
    // First try to get user from cookie-based auth
    let userData = await getUserFromCookie(request);
    
    if (userData) {
      console.log("User authenticated via cookies");
    } else {
      console.log("Cookie auth failed, trying header auth");
    }
    
    // If that fails, try to get from Authorization header
    if (!userData) {
      userData = await getUserFromAuthHeader(request);
      if (userData) {
        console.log("User authenticated via header");
      } else {
        console.log("Both auth methods failed");
      }
    }
    
    if (!userData) {
      console.log("Authentication failed - no valid user data");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = userData.id;
    console.log("User ID from auth:", userId);
    
    // Check if user ID is valid MongoDB ObjectID
    if (!isValidObjectId(userId)) {
      console.error("Invalid MongoDB ObjectID format:", userId);
      return NextResponse.json(
        { error: `Invalid user ID format: ${userId}` },
        { status: 400 }
      );
    }
    
    // Get user data
    console.log("Fetching user with ID:", userId);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log("User found:", user.name, user.email);
    
    // If user has a phone number, get their order stats
    let orderStats = {
      totalOrders: 0,
      pendingOrders: 0,
      inTransitOrders: 0,
      deliveredOrders: 0
    };
    
    if (user.phoneNumber) {
      console.log("Fetching order stats for phone:", user.phoneNumber);
      // Get total count of user's orders
      const totalOrders = await db.order.count({
        where: { phoneNumber: user.phoneNumber }
      });
      
      // Get count of warehouse orders
      const pendingOrders = await db.order.count({
        where: { 
          phoneNumber: user.phoneNumber,
          OR: [
            { status: 'IN_WAREHOUSE' },
            { status: 'PENDING' as any }
          ]
        }
      });
      
      // Get count of in transit orders
      const inTransitOrders = await db.order.count({
        where: { 
          phoneNumber: user.phoneNumber,
          OR: [
            { status: 'IN_TRANSIT' },
            { status: 'IN_UB' },
            { status: 'OUT_FOR_DELIVERY' }
          ]
        }
      });
      
      // Get count of delivered orders
      const deliveredOrders = await db.order.count({
        where: { 
          phoneNumber: user.phoneNumber,
          status: 'DELIVERED' 
        }
      });
      
      orderStats = {
        totalOrders,
        pendingOrders,
        inTransitOrders,
        deliveredOrders
      };
      
      console.log("Order stats:", orderStats);
    } else {
      console.log("User has no phone number, skipping order stats");
    }
    
    return NextResponse.json({
      user,
      orderStats
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // First try to get user from cookie-based auth
    let userData = await getUserFromCookie(request);
    
    // If that fails, try to get from Authorization header
    if (!userData) {
      userData = await getUserFromAuthHeader(request);
    }
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = userData.id;
    
    // Check if user ID is valid MongoDB ObjectID
    if (!isValidObjectId(userId)) {
      console.error("Invalid MongoDB ObjectID format:", userId);
      return NextResponse.json(
        { error: `Invalid user ID format: ${userId}` },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validate input data
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || null // Allow setting to null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 