"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  ChevronDown,
  Dock,
  Home,
  Lightbulb,
  LocateFixed,
  LogIn,
  LogOut,
  Package,
  PhoneCall,
  Pin,
  Search,
  User,
} from "lucide-react";
import Image from "next/image";
import { useUserAuth } from "@/context/UserAuthContext";

function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUserAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown function
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
    setDropdownOpen(false);
  };

  return (
    <motion.div
      className="z-50 sm:hidden fixed w-full top-0"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="bg-white/40 border-b border-gray-200 backdrop-blur-md">
        <div
          className="flex text-white myContainer justify-between items-center py-2"
          id="myTab"
          role="tablist"
        >
          <Link href={"/"} className="flex-shrink-0">
            <div className="w-full flex gap-1 items-center cursor-pointer">
              <Image
                src={"/logo.png"}
                className="object-contain"
                width={50}
                height={50}
                alt="cargomn.mn"
              />
              <h2 className="text-[39px] font-semibold text-primary">WECARGO</h2>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  type="button"
                  className="flex items-center gap-1 text-primary font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-all"
                >
                  <User size={18} />
                  <span>{user.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>Profile</span>
                      </div>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Orders</h3>
                      
                      <div className="mt-2">
                        <div className="relative flex items-center">
                          <Search size={14} className="absolute left-2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Link href="/orders" className="block mt-2 text-sm text-primary hover:underline">
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>View All Orders</span>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/sign-in">
                {/* Sign-in button for desktop header - Displayed when user is not authenticated */}
                <button className="flex items-center gap-1 text-primary font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-all">
                  <LogIn size={18} />
                  <span>Sign In</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </motion.div>
  );
}

export default Header;
