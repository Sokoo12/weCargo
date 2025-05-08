import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
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
    
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    if (!payload.id) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    const { name, phoneNumber, address } = body;
    
    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Update employee profile
    const updatedEmployee = await prisma.employee.update({
      where: { id: payload.id as string },
      data: {
        name,
        phoneNumber,
        address,
        updatedAt: new Date()
      },
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
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
} 