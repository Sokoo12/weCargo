// lib/actions/user.actions.ts
import handleError from "@/utils/handleError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createUser(user: CreateUserParams) {
  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "USER", // Default role
      },
    });

    return newUser;
  } catch (error) {
    handleError(error);
  }
}

type GetUserByIdParams = {
  userId: string;
};

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    handleError(error);
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