import { PrismaClient } from "@prisma/client";

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Instead of extending PrismaClient, we'll create a type for a singleton instance
export type PrismaClientWithExtensions = PrismaClient;

// Remove the interface that's causing type errors
// export interface ExtendedPrismaClient extends PrismaClient {
//   admin: {
//     findUnique: (args: { where: { id?: string; email?: string } }) => Promise<Admin | null>;
//     create: (args: { data: { email: string; passwordHash: string } }) => Promise<Admin>;
//     update: (args: { where: { id: string }; data: any }) => Promise<Admin>;
//     delete: (args: { where: { id: string } }) => Promise<Admin>;
//   };
// } 