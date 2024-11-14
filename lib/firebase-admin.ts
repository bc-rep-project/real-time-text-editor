import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Function to format the private key
const formatPrivateKey = (key: string) => {
  const formattedKey = key.replace(/\\n/g, '\n');
  return formattedKey;
};

if (!getApps().length) {
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');
  
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth(); 