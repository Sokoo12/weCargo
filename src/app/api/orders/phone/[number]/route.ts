import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OrderSize, OrderStatus } from "@/types/enums";
import { getUserFromRequest, ROLES } from "@/utils/auth";

const prisma = new PrismaClient();

// Use the correct type for route params according to Next.js 15
type RouteParams = {
  params: {
    number: string;
  }
};

export async function GET(request: Request, context: RouteParams) {
  try {
    // Extract the phone number directly from context.params
    const { number: phoneNumber } = context.params;
    
    console.log(`API request for phone number: ${phoneNumber}`);
    
    // Special handling for 'me' endpoint - must be logged in
    if (phoneNumber === 'me') {
      console.log("Handling 'me' endpoint request");
      
      // Debug authentication headers
      const authHeader = request.headers.get('Authorization');
      const xAuthToken = request.headers.get('x-auth-token');
      console.log("Auth headers:", { 
        hasAuthHeader: !!authHeader, 
        hasXAuthToken: !!xAuthToken,
        authHeaderStart: authHeader ? authHeader.substring(0, 15) + '...' : 'none'
      });
      
      // Get the authenticated user
      const user = await getUserFromRequest(request);
      
      if (!user || !user.phoneNumber) {
        // Log the failure details
        console.log("'me' endpoint used without proper authentication or phone number", { 
          hasUser: !!user,
          hasPhoneNumber: user ? !!user.phoneNumber : false 
        });
        
        // Handle case where user is not authenticated or has no phone
        return NextResponse.json({ 
          error: user ? "Your account doesn't have a phone number" : "Authentication required to view your orders" 
        }, { 
          status: user ? 400 : 401 
        });
      }
      
      console.log(`Authenticated user found with phone number: ${user.phoneNumber}`);
      
      // Get orders for the authenticated user's phone number
      const orders = await prisma.order.findMany({
        where: { 
          phoneNumber: user.phoneNumber 
        },
        include: {
          statusHistory: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
      });
      
      console.log(`Found ${orders.length} orders for authenticated user with phone: ${user.phoneNumber}`);
      
      if (!orders || orders.length === 0) {
        return NextResponse.json({ error: "No orders found for your account" }, { status: 404 });
      }
      
      // Sort status history
      orders.forEach(order => {
        if (order.statusHistory) {
          order.statusHistory.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
      });
      
      return NextResponse.json(orders);
    }
    
    // Regular phone number endpoint - continue with existing logic
    // Get the authenticated user for permission checking
    let user = null;
    try {
      user = await getUserFromRequest(request);
    } catch (authError) {
      console.log("Authentication error:", authError);
    }
    
    // Log request details for auditing
    console.log(`Order request for phone: ${phoneNumber}, User:`, user?.id || 'unauthenticated');
    
    // Security check: only allow users to access their own orders
    // unless they're admin or employee
    if (user) {
      const isAdmin = user.role === ROLES.ADMIN;
      const isEmployee = user.role === ROLES.EMPLOYEE;
      
      // Regular users can only access their own orders
      if (!isAdmin && !isEmployee && user.phoneNumber !== phoneNumber) {
        console.log(`Security violation: User ${user.id} with phone ${user.phoneNumber} attempted to access orders for ${phoneNumber}`);
        return NextResponse.json(
          { error: "You can only view orders for your own phone number" },
          { status: 403 }
        );
      }
    }
    
    console.log(`Searching for orders with phone number: ${phoneNumber}`);
    
    // Find all orders with matching phone number
    const orders = await prisma.order.findMany({
      where: { 
        phoneNumber: phoneNumber 
      },
      include: {
        statusHistory: true, // Include status history in the response
      },
      // Order by creation date (newest first)
      orderBy: {
        createdAt: 'desc'
      },
    });

    console.log(`Found ${orders.length} orders for phone number: ${phoneNumber}`);

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "No orders found for this phone number" }, { status: 404 });
    }

    // Sort status history by timestamp for each order (oldest first)
    orders.forEach(order => {
      if (order.statusHistory) {
        order.statusHistory.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
    });

    // Return all orders associated with this phone number
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders by phone number:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders by phone number" },
      { status: 500 }
    );
  }
}