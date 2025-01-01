import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Function to format the private key
const formatPrivateKey = (key: string) => {
  if (!key || !key.includes('PRIVATE KEY')) {
    throw new Error('Invalid private key format');
  }
  // Handle both JSON string format and raw string format
  const formattedKey = key.includes('\\n') 
    ? key.replace(/\\n/g, '\n')
    : key;
  return formattedKey;
};

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
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth(); 