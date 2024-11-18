import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import config from '../config';

let app: FirebaseApp;

// Initialize Firebase
if (!getApps().length) {
  app = initializeApp(config.firebase);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db = getFirestore(app);

// Lazy load auth only on client side
export const getFirebaseAuth = async () => {
  if (typeof window !== 'undefined') {
    const { getAuth } = await import('firebase/auth');
    return getAuth(app);
  }
  return null;
}; 