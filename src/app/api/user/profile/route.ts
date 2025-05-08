import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserAuth } from "@/utils/auth";
import { verify } from "jsonwebtoken";
import { ObjectId } from 'mongodb';

// Helper to extract and verify token from Authorization header
const getUserFromAuthHeader = async (request: NextRequest) => {
  try {
    // Check Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return null;
    
    const token = authHeader.replace("Bearer ", "");
    if (!token) return null;
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
    const decoded = verify(token, JWT_SECRET) as { id: string; email: string; role: string; name?: string };
    return decoded;
  } catch (error) {
    console.error("Error verifying auth header token:", error);
    return null;
  }
};

// Check if a string is a valid MongoDB ObjectID
const isValidObjectId = (id: string): boolean => {
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
    // First try to get user from cookie-based auth
    let userData = await getUserAuth();
    
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
    
    // Get user data
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user has a phone number, get their order stats
    let orderStats = {
      totalOrders: 0,
      pendingOrders: 0,
      inTransitOrders: 0,
      deliveredOrders: 0
    };
    
    if (user.phoneNumber) {
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
    let userData = await getUserAuth();
    
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