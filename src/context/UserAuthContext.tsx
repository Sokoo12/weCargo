"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkBrowserCookiesEnabled } from "@/utils/cookieCheck";

// Add type for window with originalFetch property
declare global {
  interface Window {
    originalFetch?: typeof fetch;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  createdAt?: string;
  image?: string;
}

interface UserAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  cookiesEnabled: boolean | null;
  login: (token: string, userData: User, usingCookies: boolean) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  cookiesEnabled: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useUserAuth = () => useContext(UserAuthContext);

// List of paths that should NOT have the fetch override applied
// This prevents circular references and fetch loops
const SKIP_AUTH_OVERRIDE_PATHS = [
  '/api/orders/phone/',
  '/api/auth/',
  '/api/users/',
  '/api/user/profile'
];

// Helper to check if a URL should skip the auth override
const shouldSkipOverride = (input: RequestInfo | URL): boolean => {
  let url: string;
  
  if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = input.toString();
  }
  
  return SKIP_AUTH_OVERRIDE_PATHS.some(path => url.includes(path));
};

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean | null>(null);
  const router = useRouter();

  // Check if cookies are enabled on component mount
  useEffect(() => {
    const checkCookies = async () => {
      const enabled = await checkBrowserCookiesEnabled();
      setCookiesEnabled(enabled);
      return enabled;
    };

    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log("Initializing auth state...");
        // First check if cookies are enabled
        const hasCookies = await checkCookies();
        
        // Try localStorage if available (for cookie fallback)
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("userToken");
          console.log("Found localStorage token:", !!token);
          
          if (token) {
            // Get user data from localStorage
            const userData = localStorage.getItem("userData");
            if (userData) {
              try {
                const parsedUser = JSON.parse(userData);
                console.log("Setting user from localStorage:", !!parsedUser);
                setUser(parsedUser);
                
                // Attach the token to subsequent requests as a custom header
                if (token) {
                  // Store original fetch function
                  window.originalFetch = window.originalFetch || window.fetch;
                  const originalFetch = window.fetch;
                  window.fetch = function(input, init) {
                    init = init || {};
                    init.headers = init.headers || {};
                    
                    // Skip override for certain API routes to prevent loops
                    if (shouldSkipOverride(input)) {
                      console.log("Skipping auth override for:", typeof input === 'object' ? input.toString() : input);
                      return originalFetch(input, init);
                    }
                    
                    // Create proper headers object with both token formats
                    const headers = new Headers(init.headers);
                    headers.set('Authorization', `Bearer ${token}`);
                    headers.set('x-auth-token', token);
                    
                    // Replace the headers object
                    init.headers = headers;
                    
                    return originalFetch(input, init);
                  };
                }
                
                setIsLoading(false);
                return;
              } catch (error) {
                console.error("Error parsing user data:", error);
                // Clear invalid data
                localStorage.removeItem("userToken");
                localStorage.removeItem("userData");
              }
            }
            
            // If we have a token but no userData, verify it
            await verifyToken(token);
          } else if (hasCookies) {
            // If no localStorage token but cookies are enabled, 
            // we attempt to verify via the API (which will check for HTTP cookies)
            await verifySessionCookie();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Verify token via API (checks the auth cookie on server)
  const verifySessionCookie = async () => {
    try {
      const response = await fetch("/api/auth/verify-session", {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          console.log("Setting user from cookie verification:", !!data.user);
          setUser(data.user);
          // Sync with localStorage as backup
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error("Error verifying session:", error);
    }
  };

  // Verify a token directly
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Setting user from token verification:", !!data.user);
        setUser(data.user);
        localStorage.setItem("userData", JSON.stringify(data.user));
      } else {
        // If token is invalid, logout
        logout();
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      logout();
    }
  };

  // Login handler with cookie/localStorage fallback
  const login = (token: string, userData: User, usingCookies: boolean) => {
    console.log("Login called with token:", token.substring(0, 10) + "...");
    console.log("Token length:", token.length);
    
    // Always store in localStorage as backup
    localStorage.setItem("userToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    
    // Add token to future fetch calls
    if (typeof window !== 'undefined' && token) {
      // Store original fetch function
      window.originalFetch = window.originalFetch || window.fetch;
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        init = init || {};
        init.headers = init.headers || {};
        
        // Skip override for certain API routes to prevent loops
        if (shouldSkipOverride(input)) {
          console.log("Skipping auth override for:", typeof input === 'object' ? input.toString() : input);
          return originalFetch(input, init);
        }
        
        // Properly format headers
        const headers = new Headers(init.headers);
        
        // Set Authorization header with Bearer format
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('x-auth-token', token);
        
        // Replace the headers object
        init.headers = headers;
        
        return originalFetch(input, init);
      };
    }
    
    // Update cookie status
    setCookiesEnabled(usingCookies);
  };

  // Logout handler
  const logout = async () => {
    try {
      console.log("Logout called");
      // Clear localStorage
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      
      // If cookies are enabled, call the logout API to clear the HTTP cookie
      if (cookiesEnabled) {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      }
      
      // Reset custom fetch function
      if (typeof window !== 'undefined' && window.originalFetch) {
        window.fetch = window.originalFetch;
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/sign-in");
    }
  };

  // Update user data
  const updateUser = (userData: User) => {
    setUser(userData);
    // Update localStorage if used
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // This effect ensures the fetch override persists after initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const token = localStorage.getItem("userToken");
      if (token) {
        console.log("Setting up fetch override with token:", token.substring(0, 10) + "...");
        
        // Store original fetch function
        window.originalFetch = window.originalFetch || window.fetch;
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          init = init || {};
          init.headers = init.headers || {};
          
          // Skip override for certain API routes to prevent loops
          if (shouldSkipOverride(input)) {
            console.log("Skipping auth override for:", typeof input === 'object' ? input.toString() : input);
            return originalFetch(input, init);
          }
          
          // Create a new Headers object to properly set the Authorization header
          const headers = new Headers(init.headers);
          
          // Set both headers for maximum compatibility
          headers.set('Authorization', `Bearer ${token}`);
          headers.set('x-auth-token', token);
          
          // Replace the headers object
          init.headers = headers;
          
          return originalFetch(input, init);
        };
      }
    }
    
    // Clean up fetch override on unmount
    return () => {
      if (typeof window !== 'undefined' && window.originalFetch) {
        window.fetch = window.originalFetch;
      }
    };
  }, [user]);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        cookiesEnabled,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
} 