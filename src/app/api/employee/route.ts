import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { PrismaClient, EmployeeRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET - Fetch all employees
export async function GET(request: NextRequest) {
  try {
    // Authentication: Only admin/manager should access this
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
    
    if (!payload.id || payload.role !== 'MANAGER') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Get all employees
    const employees = await prisma.employee.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching employees' },
      { status: 500 }
    );
  }
}

// POST - Create a new employee
export async function POST(request: NextRequest) {
  try {
    // Authentication: Only admin/manager should access this
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
    
    if (!payload.id || payload.role !== 'MANAGER') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    const { name, email, password, phoneNumber, address, role } = body;
    
    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    });
    
    if (existingEmployee) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create employee
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        passwordHash,
        phoneNumber,
        address,
        role: role as EmployeeRole,
        isActive: true,
        joinDate: new Date()
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
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json({
      message: 'Employee created successfully',
      employee: newEmployee
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating employee' },
      { status: 500 }
    );
  }
} 