// lib/actions/user.actions.ts
import handleError from "@/utils/handleError";
import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import crypto from "crypto";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-for-development";

export type SignUpParams = {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export async function signUp(userData: SignUpParams) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const passwordHash = await hash(userData.password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        passwordHash,
      },
    });

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    // Generate JWT token
    const token = sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user, token };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

export async function signIn(credentials: SignInParams) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await compare(credentials.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Create sanitized user object (without sensitive data)
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate JWT token
    const token = sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user: sanitizedUser, token };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export async function forgotPassword(email: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return { message: "If an account with that email exists, a reset link has been sent" };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Return token (in a real app, you'd send this via email)
    return { resetToken, message: "Reset token generated" };
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const passwordHash = await hash(newPassword, 10);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: "Password has been reset successfully" };
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}

type UpdateUserParams = {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
    try {
      const deletedUser = await prisma.user.delete({
        where: { clerkId },
      });
  
      return deletedUser;
    } catch (error) {
      handleError(error);
    }
  }


type UpdateUserRoleParams = {
    role: string;
  };
  
  export async function updateUserRole(clerkId: string, user: UpdateUserRoleParams) {
    try {
      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          role: user.role,
        },
      });
  
      return updatedUser;
    } catch (error) {
      handleError(error);
    }
  }