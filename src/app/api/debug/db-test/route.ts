import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("DB test API called");
    
    // Test database connection by running a simple query
    try {
      // Count users
      const userCount = await db.user.count();
      console.log("User count:", userCount);
      
      // Try to get a list of users (limit to 5)
      const users = await db.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          createdAt: true
        }
      });
      
      console.log("Found users:", users.length);
      
      // Get the MongoDB native driver connection
      const database = (db as any)._client.db();
      
      // Diagnose order counts for a better debug overview
      let orderDiagnostics = {
        totalOrders: 0,
        byStatus: {
          IN_WAREHOUSE: 0,
          PENDING: 0,
          IN_TRANSIT: 0,
          IN_UB: 0,
          OUT_FOR_DELIVERY: 0,
          DELIVERED: 0,
          CANCELLED: 0,
          nullOrUndefined: 0,
          other: 0
        },
        userPhoneNumbers: []
      };
      
      try {
        // Get counts directly from MongoDB collection
        const ordersCollection = database.collection('Order');
        
        // Total orders count
        orderDiagnostics.totalOrders = await ordersCollection.countDocuments();
        
        // Counts by status
        const statusResults = await ordersCollection.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();
        
        // Process results
        statusResults.forEach((result: { _id: string | null; count: number }) => {
          const status = result._id;
          const count = result.count;
          
          if (status === null || status === undefined) {
            orderDiagnostics.byStatus.nullOrUndefined += count;
          } else if (status in orderDiagnostics.byStatus) {
            // Need to use type assertion to fix TypeScript error
            const typedStatus = status as keyof typeof orderDiagnostics.byStatus;
            orderDiagnostics.byStatus[typedStatus] = count;
          } else {
            orderDiagnostics.byStatus.other += count;
          }
        });
        
        // Get distinct phone numbers with orders for debugging
        orderDiagnostics.userPhoneNumbers = await ordersCollection.distinct('phoneNumber');
        
      } catch (error) {
        console.error("Order diagnostics error:", error);
      }
      
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        diagnostics: {
          userCount,
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            hasEmail: !!user.email,
            hasPhone: !!user.phoneNumber,
            createdAt: user.createdAt
          })),
          orderDiagnostics
        }
      });
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.json({
        success: false,
        error: "Database operation failed",
        errorDetails: dbError instanceof Error ? dbError.message : "Unknown error",
        errorObject: dbError
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error in db-test API:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      errorDetails: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 