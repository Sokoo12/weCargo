import { cookies } from 'next/headers';
import * as jose from 'jose';

// Define role constants
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  DELIVERY: 'DELIVERY'
};

export async function getUserAuth() {
  try {
    // Do not await cookies() - it's not a Promise in Next.js
    const cookieStore = cookies();
    
    // But handle the token retrieval carefully
    let token;
    try {
      token = cookieStore.get('token')?.value;
    } catch (error) {
      console.error("Error accessing cookie:", error);
      return null;
    }
    
    if (!token) {
      console.log("No token found in cookies");
      return null;
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secretKey);
      return payload as { id: string; email: string; role: string; name?: string; phoneNumber?: string };
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return null;
    }
  } catch (error) {
    console.error("Error in getUserAuth:", error);
    return null;
  }
}

// Get user from request (either Authorization header or cookies)
export async function getUserFromRequest(request: Request) {
  // First try to get from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secretKey);
        return payload as { id: string; email: string; role: string; name?: string; phoneNumber?: string };
      } catch (error) {
        console.error("Error verifying auth header token:", error);
      }
    }
  }
  
  // If that fails, try cookies
  try {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;
      
      if (token) {
        try {
          const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
          const secretKey = new TextEncoder().encode(JWT_SECRET);
          const { payload } = await jose.jwtVerify(token, secretKey);
          return payload as { id: string; email: string; role: string; name?: string; phoneNumber?: string };
        } catch (error) {
          console.error("Error verifying cookie token:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error parsing cookies:", error);
  }
  
  return null;
} 