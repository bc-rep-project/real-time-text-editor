import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function formatPrivateKey(key: string) {
  // Handle newlines and quotes in the private key
  return key.replace(/\\n/g, '\n').replace(/\"/g, '');
}

if (!getApps().length) {
  try {
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth(); 