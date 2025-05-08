import React from 'react';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'weCargo Employee Portal',
  description: 'Employee portal for weCargo delivery management',
};

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {children}
          <Toaster position="top-right" richColors />
        </div>
      </body>
    </html>
  );
} 