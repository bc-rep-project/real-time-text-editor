'use client';

import { SessionProvider } from 'next-auth/react';
import { FirebaseProvider } from '@/components/FirebaseProvider';
import { AuthProvider } from '@/components/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FirebaseProvider>
        <AuthProvider>{children}</AuthProvider>
      </FirebaseProvider>
    </SessionProvider>
  );
} 