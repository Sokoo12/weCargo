'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to orders page
    router.push('/employee/manager/orders');
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Захиалгын удирдлага руу чиглүүлж байна...</p>
    </div>
  );
} 