import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import * as jose from 'jose';
import handleError from "@/utils/handleError";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-for-development";

export type AdminSignInParams = {
  email: string;
  password: string;
};

export async function adminSignIn(credentials: AdminSignInParams) {
  try {
    console.log(`Finding admin with email: ${credentials.email}`);
    
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: credentials.email },
    });

    if (!admin) {
      console.log(`Admin not found with email: ${credentials.email}`);
      throw new Error("Invalid email or password");
    }

    console.log(`Admin found, verifying password.`);

    // Verify password
    const isPasswordValid = await compare(credentials.password, admin.passwordHash);

    if (!isPasswordValid) {
      console.log(`Invalid password for admin: ${credentials.email}`);
      throw new Error("Invalid email or password");
    }

    console.log(`Password verified for admin: ${credentials.email}`);

    // Create sanitized admin object (without sensitive data)
    const sanitizedAdmin = {
      id: admin.id,
      email: admin.email,
    };

    // Generate JWT token using jose
    const secretKey = new TextEncoder().encode(ADMIN_JWT_SECRET);
    const token = await new jose.SignJWT({ id: admin.id, email: admin.email, role: "ADMIN" })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    return { admin: sanitizedAdmin, token };
  } catch (error) {
    console.error("Admin sign in error:", error);
    throw error;
  }
}

export async function createAdmin(email: string, password: string) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new Error("Admin with this email already exists");
    }

    // Hash the password
    const passwordHash = await hash(password, 12); // Higher cost factor for admin passwords

    // Create new admin
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
      },
    });

    return {
      id: newAdmin.id,
      email: newAdmin.email,
      createdAt: newAdmin.createdAt,
    };
  } catch (error) {
    console.error("Create admin error:", error);
    throw error;
  }
}

export async function changeAdminPassword(adminId: string, currentPassword: string, newPassword: string) {
  try {
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, admin.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash the new password
    const passwordHash = await hash(newPassword, 12);

    // Update admin with new password
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    return { message: "Password changed successfully" };
  } catch (error) {
    console.error("Change admin password error:", error);
    throw error;
  }
}

export async function verifyAdminToken(token: string) {
  try {
    const secretKey = new TextEncoder().encode(ADMIN_JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("Admin token verification error:", error);
    throw new Error("Invalid or expired admin token");
  }
} 