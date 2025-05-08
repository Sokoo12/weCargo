// Clerk webhooks are no longer needed as we've implemented custom authentication
// This file is kept for reference but is not used in the application

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    { message: "Clerk webhooks have been deprecated in favor of custom authentication" },
    { status: 400 }
  );
}
