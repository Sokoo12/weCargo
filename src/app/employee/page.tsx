'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function EmployeeIndexContent() {
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

export default function EmployeeIndexPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    }>
      <EmployeeIndexContent />
    </Suspense>
  );
} 