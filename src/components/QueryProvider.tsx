"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Optimize caching and refetching behavior
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        // Improve data fetching performance
        networkMode: 'offlineFirst',
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
