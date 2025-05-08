import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json(
    { message: 'User logged out successfully' },
    { status: 200 }
  );
  
  // Clear the user token cookie
  response.cookies.delete('auth_token');
  
  return response;
} 