'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase-client';

export const FirebaseContext = createContext<{
  initialized: boolean;
}>({
  initialized: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const auth = await getFirebaseAuth();
        if (auth) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize Firebase Auth:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      initAuth();
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ initialized }}>
      {children}
    </FirebaseContext.Provider>
  );
} 