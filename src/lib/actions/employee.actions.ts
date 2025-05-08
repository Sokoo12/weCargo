'use server';

import { PrismaClient, EmployeeRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Employee, EmployeeFormData } from '@/types/employee';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Get all employees
export async function getAllEmployees() {
  try {
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
    
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error('Failed to fetch employees');
  }
}

// Create a new employee
export async function createEmployee(employeeData: EmployeeFormData) {
  try {
    // Validation
    if (!employeeData.name || !employeeData.email || !employeeData.password || !employeeData.role) {
      throw new Error('Missing required fields');
    }
    
    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: employeeData.email }
    });
    
    if (existingEmployee) {
      throw new Error('Email already in use');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(employeeData.password, 10);
    
    // Create employee
    const newEmployee = await prisma.employee.create({
      data: {
        name: employeeData.name,
        email: employeeData.email,
        passwordHash,
        phoneNumber: employeeData.phoneNumber || null,
        address: employeeData.address || null,
        role: employeeData.role,
        isActive: employeeData.isActive ?? true,
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
    
    // Revalidate the staff page to reflect changes
    revalidatePath('/admin/staff');
    
    return newEmployee;
  } catch (error: any) {
    console.error('Error creating employee:', error);
    throw new Error(error.message || 'Failed to create employee');
  }
}

// Update an employee
export async function updateEmployee(id: string, employeeData: EmployeeFormData) {
  try {
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });
    
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    // If email is being changed, check if it's already in use
    if (employeeData.email && employeeData.email !== existingEmployee.email) {
      const emailExists = await prisma.employee.findUnique({
        where: { email: employeeData.email }
      });
      
      if (emailExists) {
        throw new Error('Email already in use');
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (employeeData.name) updateData.name = employeeData.name;
    if (employeeData.email) updateData.email = employeeData.email;
    if (employeeData.phoneNumber !== undefined) updateData.phoneNumber = employeeData.phoneNumber;
    if (employeeData.address !== undefined) updateData.address = employeeData.address;
    if (employeeData.role) updateData.role = employeeData.role;
    if (employeeData.isActive !== undefined) updateData.isActive = employeeData.isActive;
    
    // Hash and update password if provided
    if (employeeData.password) {
      updateData.passwordHash = await bcrypt.hash(employeeData.password, 10);
    }
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
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
    
    // Revalidate the staff page to reflect changes
    revalidatePath('/admin/staff');
    
    return updatedEmployee;
  } catch (error: any) {
    console.error('Error updating employee:', error);
    throw new Error(error.message || 'Failed to update employee');
  }
}

// Delete an employee
export async function deleteEmployee(id: string) {
  try {
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });
    
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    // Delete employee
    await prisma.employee.delete({
      where: { id }
    });
    
    // Revalidate the staff page to reflect changes
    revalidatePath('/admin/staff');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    throw new Error(error.message || 'Failed to delete employee');
  }
} 