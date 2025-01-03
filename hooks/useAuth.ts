'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session } = useSession();
  
  return {
    user: session?.user ? {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    } : null,
    isLoading: false,
  };
} 