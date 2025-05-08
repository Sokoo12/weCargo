import { verify } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  phoneNumber?: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
    const decoded = verify(token, JWT_SECRET) as any;
    
    // For backwards compatibility, map id to userId if needed
    if (!decoded.userId && decoded.id) {
      decoded.userId = decoded.id;
    }
    
    // Ensure we have the required fields for authentication
    if (!decoded.userId && !decoded.id) {
      console.error('Token missing required userId/id field:', decoded);
      return null;
    }
    
    if (!decoded.email) {
      console.error('Token missing required email field:', decoded);
      return null;
    }
    
    // Return normalized payload
    return {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      name: decoded.name,
      phoneNumber: decoded.phoneNumber,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Generates a JWT token for a user
 * @param payload User data to encode in the token
 * @param expiresIn Token expiration time (default: '7d')
 * @returns JWT token
 */
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresIn: string = '7d'): string {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
} 