'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function UnauthorizedContent() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">Access Denied</CardTitle>
          <CardDescription className="text-center">
            You do not have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Your employee role does not have the required permissions for this area.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/employee/login')}
          >
            Back to Login
          </Button>
          <Button 
            onClick={() => {
              fetch('/api/employee/logout', { method: 'POST' })
                .then(() => router.push('/employee/login'));
            }}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Unauthorized() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
} 