"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

const Header = ({ title }: { title: string }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gray-800 flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
      
      </div>
    </header>
  );
};
export default Header;
