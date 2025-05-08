"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteLoadingIndicator() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show loading indicator when route changes
  useEffect(() => {
    setLoading(true);
    
    // Hide loading indicator after a short delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full z-50 h-1 bg-transparent overflow-hidden">
      <div className="h-full bg-primary animate-progress-bar" />
    </div>
  );
} 