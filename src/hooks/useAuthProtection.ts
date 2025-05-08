'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/context/UserAuthContext';

/**
 * Custom hook for protecting routes that require authentication
 * Returns authentication state and loading status
 */
export function useAuthProtection() {
  const { isAuthenticated, isLoading, user, updateUser } = useUserAuth();
  const router = useRouter();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Debug auth status
    console.log("useAuthProtection hook - Auth state:", {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      redirectAttempted
    });

    // Only check once loading has completed and we haven't already tried redirecting
    if (!isLoading && !redirectAttempted) {
      setRedirectAttempted(true);

      // If user is not authenticated, redirect to sign-in
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to sign-in");
        router.push('/sign-in');
        return;
      }

      // Authentication check passed
      setIsReady(true);
    }

    // If authentication is already confirmed, mark as ready
    if (isAuthenticated && !isLoading) {
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, user, router, redirectAttempted]);

  return {
    isAuthenticated,
    isLoading,
    isReady,
    user,
    updateUser
  };
}

export default useAuthProtection; 