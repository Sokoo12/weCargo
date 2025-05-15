"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Home,
  Lightbulb,
  LogOut,
  PhoneCall,
  ScrollText,
  User,
  UserCircle,
  ChevronRight,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useUserAuth } from "@/context/UserAuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "../hooks/use-media-query";

function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useUserAuth();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Navigation items for all users
  const navItems = [
    {
      href: "/",
      icon: <Home size={20} strokeWidth={1.5} />,
      label: "Нүүр",
    },
    {
      href: "/address",
      icon: <ScrollText size={20} strokeWidth={1.5} />,
      label: "Хаяг",
    },
    {
      href: "/faq",
      icon: <Lightbulb size={20} strokeWidth={1.5} />,
      label: "Заавар",
    },
    {
      href: "/calculator",
      icon: <Calculator size={20} strokeWidth={1.5} />,
      label: "Тооцоолуур",
    },
    {
      href: "/contact",
      icon: <PhoneCall size={20} strokeWidth={1.5} />,
      label: "Холбоос",
    },
  ];

  // Add authentication button based on user state
  const authButton = isAuthenticated 
    ? {
        icon: <UserCircle size={20} strokeWidth={1.5} />,
        label: "Профайл",
      }
    : {
        href: "/sign-in",
        icon: <User size={20} strokeWidth={1.5} />,
        label: "Нэвтрэх",
      };

  // User menu items
  const userMenuItems = [
    {
      href: "/profile",
      icon: <User size={18} />,
      label: "Хувийн мэдээлэл",
    },
    {
      href: "/orders",
      icon: <Package size={18} />,
      label: "Захиалгууд",
    },
  ];

  // Determine which UI to use based on viewport size
  // Default to drawer on small screens and during hydration
  const useDrawer = !isMounted || !isDesktop;

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="weCargo logo"
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-primary">WECARGO</h1>
          </Link>
          
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Profile menu"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserCircle size={18} />
                    </div>
                    <span className="text-sm font-medium">{authButton.label}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0 rounded-lg border border-gray-200 shadow-lg" align="end">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">Хэрэглэгчийн цэс</p>
                  </div>
                  <div className="py-1">
                    {userMenuItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition duration-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                          {item.icon}
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 transition duration-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <LogOut size={18} />
                        </div>
                        <span className="text-sm">Гарах</span>
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition duration-200"
              >
                <User size={18} />
                <span className="font-medium">Нэвтрэх</span>
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className="md:hidden block">
        {/* Mobile Top Bar */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4">
          <div className="flex items-center justify-center h-full max-w-md mx-auto">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  width={36}
                  height={36}
                  alt="weCargo logo"
                  className="object-contain"
                  priority
                />
                <h1 className="text-xl font-semibold text-primary ml-2">WECARGO</h1>
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50">
          {navItems.slice(0, 4).map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="w-full h-full"
            >
              <div className={`h-full flex flex-col items-center justify-center transition duration-200 ${pathname === item.href ? "text-primary" : "text-gray-500"}`}>
                <div className="relative">
                  {pathname === item.href && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-primary"></div>
                  )}
                  {item.icon}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
              </div>
            </Link>
          ))}
          
          {isAuthenticated ? (
            <Drawer>
              <DrawerTrigger asChild>
                <button 
                  type="button" 
                  aria-label="User menu"
                  className="w-full h-full"
                >
                  <div className={`h-full flex flex-col items-center justify-center transition duration-200 ${pathname.startsWith('/profile') ? "text-primary" : "text-gray-500"}`}>
                    <div className="relative">
                      {pathname.startsWith('/profile') && (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-primary"></div>
                      )}
                      {authButton.icon}
                    </div>
                    <span className="text-[10px] mt-1">{authButton.label}</span>
                  </div>
                </button>
              </DrawerTrigger>
              <DrawerContent className="rounded-t-xl">
                <div className="bg-gradient-to-r from-primary to-blue-500 text-white p-5 rounded-t-xl">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <UserCircle size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Хэрэглэгч</h3>
                      <p className="text-xs text-white/80">Тавтай морил</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {userMenuItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="block"
                      >
                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col items-center shadow-sm hover:shadow transition duration-200">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 text-gray-700">
                            {item.icon}
                          </div>
                          <span className="text-xs font-medium text-center">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <LogOut size={18} />
                        </div>
                        <span className="text-sm font-medium">Гарах</span>
                      </div>
                      <ChevronRight size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Link 
              href="/sign-in"
              className="w-full h-full"
            >
              {/* Sign-in button for unauthenticated users - Shows in the mobile navigation bar bottom menu */}
              <div className={`h-full flex flex-col items-center justify-center transition duration-200 ${pathname === '/sign-in' ? "text-primary" : "text-gray-500"}`}>
                <div className="relative">
                  {pathname === '/sign-in' && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full bg-primary"></div>
                  )}
                  {authButton.icon}
                </div>
                <span className="text-[10px] mt-1">{authButton.label}</span>
              </div>
            </Link>
          )}
        </nav>
        
        {/* Safe area for content */}
        <div className="h-16 w-full"></div>
        <div className="pb-16 w-full"></div>
      </div>
    </>
  );
}

export default MobileNav;