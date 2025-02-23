"use client";
import {
  BarChart2,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@clerk/nextjs";

const SIDEBAR_ITEMS = [
  {
    name: "Хураангуй",
    icon: BarChart2,
    color: "#6366f1",
    href: "/admin",
  },
  {
    name: "Ачаа",
    icon: ShoppingBag,
    color: "#8B5CF6",
    href: "/admin/packages",
  },
  { name: "Ажилтан", icon: Users, color: "#EC4899", href: "/admin/staff" },

  // {
  //   name: "Analytics",
  //   icon: TrendingUp,
  //   color: "#3B82F6",
  //   href: "/admin/analytics",
  // },
  // {
  //   name: "Тохиргоо",
  //   icon: Settings,
  //   color: "#6EE7B7",
  //   href: "/admin/settings",
  // },
  // {
  //   name: "Гарах",
  //   icon: LogOut,
  //   color: "#10B981",
  //   href: "/admin/sales",
  // },
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
        >
          <Menu size={24} />
        </motion.button>

        <nav className="mt-8 flex-grow">
          {SIDEBAR_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                <item.icon
                  size={20}
                  style={{ color: item.color, minWidth: "20px" }}
                />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-4 whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}

          <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
            <LogOut size={20} style={{ color: "#10B981", minWidth: "20px" }} />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  className="ml-4 whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <SignOutButton>Гарах</SignOutButton>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          {/* <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
           
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  className="ml-4 whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                 <SignedOut/>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div> */}
        </nav>
        <Image
          src={"/logo.png"}
          className="object-contain mx-auto grayscale opacity-10"
          width={150}
          height={150}
          alt="cargomn.mn"
        />
      </div>
    </motion.div>
  );
};
export default Sidebar;
