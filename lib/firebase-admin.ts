import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

function formatPrivateKey(key: string) {
  const privateKey = key.replace(/\\n/g, '\n');
  return privateKey.startsWith('"') ? JSON.parse(privateKey) : privateKey;
}

let app: App;

if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PROJECT_ID) {
      throw new Error('Firebase credentials not found');
    }

    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    console.error('Private key:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) + '...');
    throw error;
  }
} else {
  app = getApps()[0];
}

export { app };
export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const realtimeDb = getDatabase(); 