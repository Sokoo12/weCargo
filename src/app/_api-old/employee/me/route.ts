import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('employee_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify the token
    const EMPLOYEE_JWT_SECRET = process.env.EMPLOYEE_JWT_SECRET || "employee-secret-key-for-development";
    const secretKey = new TextEncoder().encode(EMPLOYEE_JWT_SECRET);
    
    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      
      if (!payload.id) {
        return NextResponse.json(
          { message: 'Invalid token' },
          { status: 401 }
        );
      }
      
      // Get employee data without password
      const employee = await prisma.employee.findUnique({
        where: { id: payload.id as string },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phoneNumber: true,
          address: true,
          isActive: true,
          joinDate: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (!employee) {
        return NextResponse.json(
          { message: 'Employee not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(employee);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
} 