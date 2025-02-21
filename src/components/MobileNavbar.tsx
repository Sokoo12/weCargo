"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Home,
  Lightbulb,
  PhoneCall,
  ScrollText,
} from "lucide-react";
import Image from "next/image";

function MobileNav() {
  const pathname = usePathname();

  // Navigation items
  const navItems = [
    {
      href: "/",
      icon: <Home size={24} strokeWidth={1} />,
      label: "Нүүр",
    },
    {
      href: "/address",
      icon: <ScrollText size={24} strokeWidth={1} />,
      label: "Хаяг",
    },
    {
      href: "/faq",
      icon: <Lightbulb size={24} strokeWidth={1} />,
      label: "Заавар",
    },
    {
      href: "/calculator",
      icon: <Calculator size={24} strokeWidth={1} />,
      label: "Тооцоолуур",
    },
    {
      href: "/contact",
      icon: <PhoneCall size={24} strokeWidth={1} />,
      label: "Холбоос",
    },
  ];

  return (
    <motion.div
      className="z-20"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav
        className={`h-fit rounded-lg z-20 fixed bottom-5 sm:top-0 sm:left-0 sm:right-0 left-5 right-5 md:rounded-none sm:bg-white bg-white/40 backdrop-blur-lg border border-gray-300 shadow-md sm:shadow-none`}
      >
        <ul
          className="flex text-gray-800 justify-between items-center p-2 sm:py-1 sm:myContainer md:px-8 xl:px-10"
          id="myTab"
          role="tablist"
        >
          {/* Logo */}
          <div className="hidden sm:block sm:w-[40%] lg:w-[50%] xl:w-[60%] py-2">
            <Link
              href={"/"}
              className="w-full flex gap-1 items-center cursor-pointer"
            >
              <Image
                src={"/logo.png"}
                className="object-contain"
                width={50}
                height={50}
                alt="cargomn.mn"
              />
              <h2 className="text-[39px] font-semibold text-primary">CARGOO</h2>
            </Link>
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex rounded-full flex-col md:pr-3 md:flex-row gap-1 items-center pl-[2px] ${
                pathname === item.href
                  ? "sm:bg-primary sm:text-white sm:border-[5px] border-white/80"
                  : "inactive"
              }`}
            >
              <button
                className={`p-2 rounded-full ${
                  pathname === item.href ? "bg-primary sm:text-white border-[3px] sm:border-none border-white/80 text-white" : "inactive"
                }`}
              >
                {item.icon}
              </button>
              <span className="text-[10px] sm:text-[14px]">{item.label}</span>
            </Link>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}

export default MobileNav;