import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find employee by email
    const employee = await prisma.employee.findUnique({
      where: { email }
    });

    if (!employee) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if employee is active
    if (!employee.isActive) {
      return NextResponse.json(
        { message: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, employee.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.employee.update({
      where: { id: employee.id },
      data: { lastLogin: new Date() }
    });

    // Create JWT token
    const EMPLOYEE_JWT_SECRET = process.env.EMPLOYEE_JWT_SECRET || "employee-secret-key-for-development";
    const secret = new TextEncoder().encode(EMPLOYEE_JWT_SECRET);
    const token = await new jose.SignJWT({
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      isActive: employee.isActive,
      phoneNumber: employee.phoneNumber || null
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    // Set token in cookie
    const response = NextResponse.json({
      message: 'Login successful',
      role: employee.role,
      name: employee.name
    });
    
    response.cookies.set('employee_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Employee login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 