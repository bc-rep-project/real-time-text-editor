import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../config';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(config.firebase) : getApps()[0];

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app); 