'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/employee/login');
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-center text-gray-500">Redirecting to login page...</p>
    </div>
  );
} 