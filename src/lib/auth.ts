import { verify, sign } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  phoneNumber?: string;
}

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
    const decoded = verify(token, JWT_SECRET) as any;
    
    // For backwards compatibility, map id to userId if needed
    if (!decoded.userId && decoded.id) {
      decoded.userId = decoded.id;
    }
    
    // Return normalized payload
    return {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'USER',
      name: decoded.name,
      phoneNumber: decoded.phoneNumber
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Generates a JWT token for a user
 * @param payload User data to encode in the token
 * @returns JWT token
 */
export function generateToken(payload: TokenPayload): string {
  const JWT_SECRET = process.env.JWT_SECRET || "Key123!";
  
  return sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }, 
    JWT_SECRET
  );
} 