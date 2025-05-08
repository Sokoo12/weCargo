import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json(
    { message: 'Admin logged out successfully' },
    { status: 200 }
  );
  
  // Clear the admin token cookie
  response.cookies.delete('admin_token');
  
  return response;
} 