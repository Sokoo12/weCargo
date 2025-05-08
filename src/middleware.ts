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
  
  // Log middleware execution for debugging
  console.log(`Middleware executing for path: ${pathname}`);
  
  // For debug routes, always allow
  if (pathname.startsWith("/api/debug") || pathname === "/api/health") {
    console.log("Debug route, allowing access");
    return NextResponse.next();
  }
  
  // Get auth token from cookies or auth header
  const token = request.cookies.get("auth_token")?.value;
  
  // Also check localStorage token via a custom header (client can send this)
  const localStorageToken = request.headers.get("x-auth-token");
  
  // Determine if user is authenticated via cookie or header
  const isAuthenticated = !!token || !!localStorageToken;
  
  // Check if this is an API route
  const isApiRoute = pathname.startsWith("/api");
  
  // For protected API routes, check authentication
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      console.log(`API auth required but not authenticated: ${pathname}`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.log(`API auth check passed: ${pathname}`);
    return NextResponse.next();
  }
  
  // For the profile page specifically, let the client-side handle authentication
  // This prevents the redirect loop issue
  if (pathname === "/profile") {
    console.log(`Allowing client-side auth check for profile page`);
    return NextResponse.next();
  }
  
  // For protected user routes, verify auth
  if (userProtectedRoutes.some(route => pathname.startsWith(route))) {
    // If no token, redirect to sign-in
    if (!isAuthenticated) {
      console.log(`No auth token found, redirecting to sign-in from ${pathname}`);
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // For auth routes, if user is already authenticated, redirect to home
  if (userAuthRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      console.log(`User already authenticated, redirecting to home from ${pathname}`);
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
    
    // Original pattern for non-API routes
    '/((?!_next|fonts|illustrations|[\\w-]+\\.\\w+).*)',
  ],
};
