import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function formatPrivateKey(key: string) {
  const privateKey = key.replace(/\\n/g, '\n');
  return privateKey.startsWith('"') ? JSON.parse(privateKey) : privateKey;
}

if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PROJECT_ID) {
      throw new Error('Firebase credentials not found');
    }

    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    console.error('Private key:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) + '...');
    throw error;
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth(); 