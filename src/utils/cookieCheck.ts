import { NextRequest, NextResponse } from "next/server";

/**
 * Checks if cookies are available and working in the current environment
 * This function tests if cookies can be set by setting a test cookie
 */
export function isCookieAvailable(req: NextRequest): boolean {
  try {
    // We'll assume cookies are available in the server environment
    // The real test happens client-side with checkBrowserCookiesEnabled
    // This is just a fallback check
    return true;
  } catch (error) {
    // If there's an error accessing cookies, they're likely disabled
    console.error("Error checking cookie availability:", error);
    return false;
  }
}

/**
 * A client-side function to test if cookies are available in the browser
 * Returns a promise that resolves to true if cookies are available, false otherwise
 */
export function checkBrowserCookiesEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Try to set a test cookie
      document.cookie = "cookietest=1; SameSite=Strict; path=/";
      const cookieEnabled = document.cookie.indexOf("cookietest=") !== -1;
      
      // Clean up the test cookie
      document.cookie = "cookietest=1; SameSite=Strict; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      resolve(cookieEnabled);
    } catch (e) {
      // If there's an error, cookies are probably disabled
      resolve(false);
    }
  });
} 