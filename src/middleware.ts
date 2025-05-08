import { NextRequest, NextResponse } from "next/server";

// Define routes
const userProtectedRoutes = ["/dashboard", "/profile", "/orders"];
const userAuthRoutes = ["/sign-in", "/sign-up", "/forgot-password"];
const adminRoutes = ["/admin"];
const adminAuthRoutes = ["/admin/login"];
const employeeRoutes = ["/employee"];
const employeeAuthRoutes = ["/employee/login"];

// API routes that require authentication
const protectedApiRoutes = ["/api/users/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For debug routes, always allow
  if (pathname.startsWith("/api/debug") || pathname === "/api/health") {
    return NextResponse.next();
  }
  
  // Check authorization header for authentication
  const authHeader = request.headers.get("authorization");
  const isAuthenticated = !!authHeader && authHeader.startsWith("Bearer ");
  const isApiRoute = pathname.startsWith("/api");
  
  // For protected API routes, check authentication
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }
  
  // For the profile page specifically, let the client-side handle authentication
  if (pathname === "/profile") {
    return NextResponse.next();
  }
  
  // For protected user routes, verify auth
  if (userProtectedRoutes.some(route => pathname.startsWith(route))) {
    // If no token, redirect to sign-in
    if (!isAuthenticated) {
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // For auth routes, if user is already authenticated, redirect to home
  if (userAuthRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Include specific API routes that need auth checking
    '/api/users/profile',
    '/api/health',
    '/api/debug/auth',
    
    // Optimize the matcher pattern to be more specific
    '/(dashboard|profile|orders|sign-in|sign-up|forgot-password|admin|employee)/:path*',
  ],
};
