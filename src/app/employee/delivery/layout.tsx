'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Truck, User, Menu, X } from 'lucide-react';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch employee data
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch('/api/employee/me');
        if (response.ok) {
          const data = await response.json();
          setEmployeeName(data.name || 'Delivery Employee');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, []);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/employee/logout', { method: 'POST' });
      router.push('/employee/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const NavItems = () => (
    <ul className="w-full">
      <li>
        <Link href="/employee/delivery">
          <div className={`flex items-center px-6 py-3 text-sm ${pathname === '/employee/delivery' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Package className="w-5 h-5 mr-3" />
            <span>Delivery List</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/employee/delivery/history">
          <div className={`flex items-center px-6 py-3 text-sm ${pathname === '/employee/delivery/history' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Truck className="w-5 h-5 mr-3" />
            <span>Delivery History</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/employee/delivery/profile">
          <div className={`flex items-center px-6 py-3 text-sm ${pathname === '/employee/delivery/profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
            <User className="w-5 h-5 mr-3" />
            <span>Profile</span>
          </div>
        </Link>
      </li>
    </ul>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800">weCargo</h2>
          <p className="text-xs text-gray-600">Delivery Portal</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Welcome, {employeeName}</p>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="mt-2">
              <NavItems />
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">weCargo</h2>
          <p className="text-sm text-gray-600">Delivery Portal</p>
        </div>
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-gray-600">Welcome, {employeeName}</p>
        </div>
        <nav className="mt-6">
          <NavItems />
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8">
        {children}
      </div>
    </div>
  );
} 