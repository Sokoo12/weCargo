"use client";

import { useEffect } from "react";
import { preconnectToDomains } from "@/lib/performance";

export function PerformanceProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    // Set up performance optimizations
    preconnectToDomains();
  }, []);
  
  return <>{children}</>;
} 