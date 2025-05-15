"use client";
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// Store original fetch globally to prevent losing reference
if (typeof window !== 'undefined' && !window.originalFetch) {
  window.originalFetch = window.fetch;
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
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useUserAuth = () => useContext(UserAuthContext);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Add auth header to all fetch requests when user is logged in
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for logged in user on initial load
    const storedToken = localStorage.getItem("userToken");
    const storedUserData = localStorage.getItem("userData");
    
    if (storedToken && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        // Basic validation to ensure parsed data has expected structure
        if (userData && userData.id && userData.email) {
          setUser(userData);
        } else {
          // Clear invalid data
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Set up fetch interceptor when auth state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem("userToken");
    if (!token) return;
    
    // Make sure original fetch is preserved
    const originalFetch = window.originalFetch || window.fetch;
    
    window.fetch = function(input, init = {}) {
      // Create a new init object to avoid modifying the original
      const newInit = { ...init };
      
      // Create headers object if it doesn't exist
      newInit.headers = new Headers(newInit.headers || {});
      
      // Add Authorization header
      if (token) {
        (newInit.headers as Headers).set('Authorization', `Bearer ${token}`);
      }
      
      // Call original fetch with new init object
      return originalFetch(input, newInit);
    };
    
    return () => {
      // Restore original fetch when component unmounts
      window.fetch = originalFetch;
    };
  }, [user]);

  // Login handler
  const login = (token: string, userData: User) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUser(null);
    router.push("/");
  };

  // Update user data
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading]
  );

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
} 