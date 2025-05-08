"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check login status whenever the component renders or cookies change
  useEffect(() => {
    const checkLoginStatus = () => {
      const hasToken = !!Cookies.get('admin_token');
      setIsLoggedIn(hasToken);
      
      if (hasToken) {
        console.log("Admin token detected on page load");
      }
    };
    
    checkLoginStatus();
    
    // Set up an interval to periodically check token status
    const interval = setInterval(checkLoginStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // When in development mode, pre-populate with admin credentials from the script
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('admin@example.com');
      setPassword('Admin123!');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo(null);

    try {
      console.log("Attempting admin login with:", { email });
      
      const response = await fetch("/api/admin/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", { status: response.status, ok: response.ok });

      if (!response.ok) {
        console.error("Login failed:", data);
        setDebugInfo(JSON.stringify(data, null, 2));
        throw new Error(data.error || "Login failed");
      }

      // The token is set as an HTTP-only cookie by the server
      toast.success("Admin login successful");
      
      // Store token in localStorage for client-side auth check
      localStorage.setItem('adminToken', data.token);
      
      // Update login state
      setIsLoggedIn(true);
      
      // Add a deliberate delay to allow cookies to be properly set
      console.log("Waiting briefly for cookie propagation...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Skip Next.js router and use direct window location change
      console.log("Using direct window location for navigation");
      window.location.href = "/admin";
      
      // As a backup, if we're still here after a delay, try again
      setTimeout(() => {
        if (window.location.pathname.includes('/login')) {
          console.log("First navigation attempt failed, trying again");
          window.location.replace("/admin");
        }
      }, 2000);
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 backdrop-blur-sm z-0" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-2xl relative z-10 border border-gray-700"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to access the admin dashboard</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-200 placeholder-gray-500 border border-gray-600 rounded-md bg-gray-700/50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-200 placeholder-gray-500 border border-gray-600 rounded-md bg-gray-700/50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {debugInfo && (
            <div className="p-2 bg-red-900/50 rounded text-xs text-red-300 max-h-32 overflow-auto">
              <pre>{debugInfo}</pre>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Sign in"}
            </button>
          </div>
          
          <div className="flex justify-center text-sm">
            <a 
              href="/admin" 
              className="text-indigo-400 hover:text-indigo-300 mt-2"
              onClick={(e) => {
                if (Cookies.get('admin_token')) {
                  console.log("Manual navigation to /admin");
                } else {
                  e.preventDefault();
                  toast.error("Please login first");
                }
              }}
            >
              Manual navigation to Admin Dashboard
            </a>
          </div>
          
          {/* Success navigation section - will appear after successful login */}
          {isLoggedIn && (
            <div className="mt-4 p-3 bg-green-800/30 border border-green-700 rounded-md">
              <p className="text-green-300 text-sm mb-2">Login successful! Having trouble with automatic navigation?</p>
              <a 
                href="/admin" 
                className="block w-full py-2 px-4 bg-green-700 hover:bg-green-600 rounded-md text-center text-white font-medium"
              >
                Go to Admin Dashboard
              </a>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
} 