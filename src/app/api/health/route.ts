import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    port: process.env.PORT || "default (3000)",
    timestamp: new Date().toISOString()
  });
} 