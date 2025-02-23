import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/express";

const prisma = new PrismaClient();

export async function GET() {
  // try {
  //   const users = await prisma.user.findMany();
  //   return NextResponse.json(users, { status: 200 });
  // } catch (error) {
  //   console.error("Error fetching users:", error);
  //   return NextResponse.json(
  //     { error: "Failed to fetch users" },
  //     { status: 500 }
  //   );
  // }

  try {
    const response = await clerkClient.users.getUserList({
      orderBy: "-created_at",
      limit: 10,
    });

    // const user = response.data

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      error: "Failed to fetch users",
      status: 500,
    });
  }
}
