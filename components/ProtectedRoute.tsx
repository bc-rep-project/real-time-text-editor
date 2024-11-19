'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps extends PropsWithChildren {
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session && requireAuth) {
      router.push('/login');
    } else if (session && !requireAuth) {
      // Redirect away from login/register pages if already authenticated
      router.push('/');
    }
  }, [session, status, requireAuth, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!session && requireAuth) {
    return null;
  }

  if (session && !requireAuth) {
    return null;
  }

  return <>{children}</>;
} 