'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db as firestore } from '@/lib/firebase-client';

export const FirebaseContext = createContext<{
  initialized: boolean;
}>({
  initialized: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  return (
    <FirebaseContext.Provider value={{ initialized }}>
      {children}
    </FirebaseContext.Provider>
  );
} 