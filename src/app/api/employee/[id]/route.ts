import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { PrismaClient, EmployeeRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET - Fetch a single employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
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
    
    if (!payload.id || (payload.role !== 'MANAGER' && payload.id !== params.id)) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Get employee by ID
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
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
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching employee' },
      { status: 500 }
    );
  }
}

// PUT - Update an employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
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
    
    // Only managers can update other employees, or employees can update their own profile
    if (!payload.id || (payload.role !== 'MANAGER' && payload.id !== params.id)) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    const { name, email, password, phoneNumber, address, role, isActive } = body;
    
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    });
    
    if (!existingEmployee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // If email is being changed, check if it's already in use
    if (email && email !== existingEmployee.email) {
      const emailExists = await prisma.employee.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    
    // Only managers can update role and active status
    if (payload.role === 'MANAGER') {
      if (role) updateData.role = role as EmployeeRole;
      if (isActive !== undefined) updateData.isActive = isActive;
    }
    
    // Hash and update password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating employee' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication: Only managers can delete employees
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
    
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    });
    
    if (!existingEmployee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Delete employee
    await prisma.employee.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting employee' },
      { status: 500 }
    );
  }
} 