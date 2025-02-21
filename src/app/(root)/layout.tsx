import Header from "@/components/Header";
import MobileNav from "@/components/MobileNavbar";
import React from "react";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative bg-gradient-to-br from-gray-200 to-gray-100">
      <Header />
      <div>{children}</div>
      <Toaster position="top-right" richColors/>
      <MobileNav />
    </main>
  );
};

export default Layout;
