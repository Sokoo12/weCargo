import { EmployeeRole } from "@prisma/client";

export type Employee = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  role: EmployeeRole;
  isActive: boolean;
  joinDate: Date | string;
  lastLogin?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type EmployeeFormData = {
  name: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  role: EmployeeRole;
  isActive?: boolean;
}; 