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
    // First attempt the simple check
    return ObjectId.isValid(id);
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
    
    try {
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
        console.log("User not found in database with ID:", userId);
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
      
      try {
        if (user.phoneNumber) {
          console.log("Fetching order stats for phone:", user.phoneNumber);
          
          // Using Prisma directly for simplicity
          // Get all orders for this phone number first
          const allOrders = await db.order.findMany({
            where: {
              phoneNumber: user.phoneNumber
            },
            select: {
              id: true,
              status: true
            }
          });
          
          console.log(`Found ${allOrders.length} orders for user`);
          
          // Count them manually for more reliable results
          const totalOrders = allOrders.length;
          
          // Count orders by status
          let pendingCount = 0;
          let transitCount = 0;
          let deliveredCount = 0;
          
          for (const order of allOrders) {
            const status = order.status;
            
            // Handle null status safely
            if (!status) continue;
            
            // Use string comparison for safety
            if (status === 'IN_WAREHOUSE' || status.toString() === 'PENDING') {
              pendingCount++;
            } else if (['IN_TRANSIT', 'IN_UB', 'OUT_FOR_DELIVERY'].includes(status)) {
              transitCount++;
            } else if (status === 'DELIVERED') {
              deliveredCount++;
            }
          }
          
          orderStats = {
            totalOrders,
            pendingOrders: pendingCount,
            inTransitOrders: transitCount,
            deliveredOrders: deliveredCount
          };
          
          console.log("Order stats:", orderStats);
        } else {
          console.log("User has no phone number, skipping order stats");
        }
      } catch (orderStatsError) {
        console.error("Error fetching order stats:", orderStatsError);
        // Continue with empty stats rather than failing
      }
      
      return NextResponse.json({
        user,
        orderStats
      });
    } catch (dbError) {
      console.error("Database error during profile fetch:", dbError);
      return NextResponse.json(
        { 
          error: 'Database error fetching user profile',
          details: dbError instanceof Error ? dbError.message : "Unknown database error"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : "Unknown error" 
      },
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