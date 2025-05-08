"use client";
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
    if (!user || !token) return;
    
    const originalFetch = window.fetch;
    
    window.fetch = function(input, init = {}) {
      // Add auth headers to all requests
      const headers = new Headers(init.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      
      return originalFetch(input, {
        ...init,
        headers
      });
    };
    
    return () => {
      // Restore original fetch when component unmounts or auth changes
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