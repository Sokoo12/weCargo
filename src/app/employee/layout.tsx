'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from 'sonner';

// Load font outside the component to ensure it's consistent
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-inter',
});

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} employee-layout`}>
      <div className="min-h-screen flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
} 