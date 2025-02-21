"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Dock,
  Home,
  Lightbulb,
  LocateFixed,
  PhoneCall,
  Pin,
} from "lucide-react";
import Image from "next/image";

function Header() {
  const pathname = usePathname();

  // console.log(router.pathname)

  return (
    <motion.div
      className="z-20 sm:hidden fixed w-full top-0"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="bg-white/40 border-b border-gray-200 backdrop-blur-md">
        <ul
          className="flex text-white myContainer  justify-between items-center py-2"
          id="myTab"
          role="tablist"
        >
          <Link href={"/"} className="mx-auto">
            <div className="w-full flex gap-1 items-center cursor-pointer">
              <Image
                src={"/logo.png"}
                className="object-contain"
                width={50}
                height={50}
                alt="cargomn.mn"
              />
              <h2 className="text-[39px] font-semibold text-primary">CARGOO</h2>
            </div>
          </Link>
        </ul>
      </nav>
    </motion.div>
  );
}

export default Header;
