// utils/auth.ts
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export enum ROLES {
  USER = "USER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE"
}

// Simple function to get user info from a request
export const getUserFromRequest = async (request: Request) => {
  try {
    // Try to get token from authorization header
    const authHeader = request.headers.get('Authorization');
    let token = null;
    
    // Handle different authorization header formats
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      } else {
        token = authHeader; // Use as-is if no prefix
      }
    }
    
    // If no token in auth header, try custom header
    if (!token) {
      token = request.headers.get('x-auth-token');
    }
    
    // If we still don't have a token
    if (!token) {
      console.log("No authentication token found in request headers");
      return null;
    }
    
    // Verify the token
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
      console.log("Using JWT_SECRET:", JWT_SECRET ? "Set from env" : "Using fallback");
      
      // Verify and decode the token
      const decoded = verify(token, JWT_SECRET) as { 
        id: string; 
        email: string; 
        role: string; 
        phoneNumber?: string; 
        name?: string;
      };
      console.log("Successfully verified token for:", decoded.email || decoded.id);
      return decoded;
    } catch (error) {
      console.error("Failed to verify token:", error);
      return null;
    }
  } catch (error) {
    console.error("Error in getUserFromRequest:", error);
    return null;
  }
};

// User authentication from cookies only (for server components)
export const getUserAuth = async () => {
  try {
    let token = null;
    
    try {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get("auth_token");
      token = authCookie?.value;
    } catch (cookieError) {
      console.error("Error accessing cookies:", cookieError);
    }
    
    if (!token) {
      return null;
    }
    
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
      const decoded = verify(token, JWT_SECRET) as { 
        id: string; 
        email: string; 
        role: string; 
        phoneNumber?: string; 
        name?: string;
      };
      return decoded;
    } catch (error) {
      console.error("Failed to verify token:", error);
      return null;
    }
  } catch (error) {
    console.error("Error in getUserAuth:", error);
    return null;
  }
};

// Admin authentication
export const getAdminAuth = async () => {
  try {
    let token = null;
    
    try {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get("admin_token");
      token = authCookie?.value;
    } catch (cookieError) {
      console.error("Error accessing cookies:", cookieError);
    }
    
    if (!token) {
      return null;
    }
    
    try {
      const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret";
      const decoded = verify(token, ADMIN_JWT_SECRET) as { 
        id: string; 
        email: string; 
        role: string;
      };
      return decoded;
    } catch (error) {
      console.error("Failed to verify admin token:", error);
      return null;
    }
  } catch (error) {
    console.error("Error in getAdminAuth:", error);
    return null;
  }
};

// Check if user has specific role
export const checkRole = async (role: ROLES) => {
  if (role === ROLES.ADMIN) {
    const admin = await getAdminAuth();
    return admin?.role === ROLES.ADMIN;
  } else {
    const user = await getUserAuth();
    return user?.role === role;
  }
};
