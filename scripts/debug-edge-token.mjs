// Debug script to test jose JWT functions
import * as jose from 'jose';

async function main() {
  const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-for-development";
  const secretKey = new TextEncoder().encode(ADMIN_JWT_SECRET);
  
  console.log('=== JWT Token Testing with jose ===');
  
  try {
    // Create a test admin payload
    const adminPayload = { 
      id: '681b107de3dbe6467063693c', 
      email: 'admin@example.com', 
      role: 'ADMIN' 
    };
    
    console.log('Creating JWT token with payload:', adminPayload);
    
    // Generate JWT token with jose
    const token = await new jose.SignJWT(adminPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);
    
    console.log('\nGenerated token:', token);
    console.log(`\nToken length: ${token.length} characters`);
    
    // Verify the token
    console.log('\nVerifying token...');
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    console.log('Token verification successful!');
    console.log('Decoded payload:', payload);
    
    // Instructions for testing
    console.log('\n=== Testing Instructions ===');
    console.log('1. Copy this token to test in your browser:');
    console.log(token);
    console.log('\n2. Visit http://localhost:3000/api/debug/check-token after setting this cookie:');
    console.log(`3. Use browser devtools to set: document.cookie="admin_token=${token}; path=/;"`);
    
  } catch (error) {
    console.error('Error during JWT testing:', error);
  }
}

main().catch(console.error); 