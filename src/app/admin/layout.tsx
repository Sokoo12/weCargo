"use client";
import Sidebar from "@/app/admin/components/common/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/QueryProvider";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { useRouter, usePathname } from "next/navigation";

function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip auth check if already on login page
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    // Check if token exists
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/admin/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [pathname, router]);

  // Don't render until we've checked auth
  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-100">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // Skip layout for login page
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <AdminAuthProvider>
      <QueryProvider>
        <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
          {/* BG */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
            <div className="absolute inset-0 backdrop-blur-sm" />
          </div>
          <Toaster richColors />
          <Sidebar />
          {children}
        </div>
      </QueryProvider>
    </AdminAuthProvider>
  );
}

export default AdminLayout;
