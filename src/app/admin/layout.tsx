import Sidebar from "@/app/admin/components/common/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/QueryProvider";

async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  return (
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
  );
}

export default AdminLayout;
