'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Package, User, Settings, UserCircle } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Create a client
const queryClient = new QueryClient();

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [managerName, setManagerName] = useState('');

  useEffect(() => {
    // Fetch manager data
    const fetchManagerData = async () => {
      try {
        const response = await fetch('/api/employee/me');
        if (response.ok) {
          const data = await response.json();
          setManagerName(data.name || 'Manager');
        }
      } catch (error) {
        console.error('Error fetching manager data:', error);
      }
    };

    fetchManagerData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/employee/logout', { method: 'POST' });
      router.push('/employee/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">weCargo</h2>
            <p className="text-sm text-gray-600">Менежерийн удирдлага</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-600">Тавтай морил, {managerName}</p>
          </div>
          <nav className="mt-6">
            <ul>
              <li>
                <Link href="/employee/manager/orders">
                  <div className={`flex items-center px-6 py-3 text-sm ${pathname === '/employee/manager/orders' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Package className="w-5 h-5 mr-3" />
                    <span>Захиалгууд</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/employee/manager/profile">
                  <div className={`flex items-center px-6 py-3 text-sm ${pathname === '/employee/manager/profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <User className="w-5 h-5 mr-3" />
                    <span>Профайл</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  <span>Профайл</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <div className="p-2 border-b">
                  <p className="font-medium text-sm">{managerName}</p>
                  <p className="text-xs text-gray-500">Менежер</p>
                </div>
                <div className="py-2">
                  <Link href="/employee/manager/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
                    <User size={16} />
                    <span>Хувийн мэдээлэл</span>
                  </Link>
                  <Link href="/employee/manager/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
                    <Settings size={16} />
                    <span>Тохиргоо</span>
                  </Link>
                  <div 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Гарах</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </QueryClientProvider>
  );
} 