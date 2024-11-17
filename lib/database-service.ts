import { db } from './firebase-client';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { COLLECTIONS, Document, User, UserPresence } from '../types/database';

export class DatabaseService {
  // User operations
  async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // Document operations
  async createDocument(documentData: Partial<Document>): Promise<string> {
    const docRef = doc(collection(db, COLLECTIONS.DOCUMENTS));
    await setDoc(docRef, {
      ...documentData,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updateDocument(documentId: string, data: Partial<Document>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  // User presence operations
  async updateUserPresence(presenceData: Partial<UserPresence>): Promise<void> {
    const presenceRef = doc(
      collection(db, COLLECTIONS.USER_PRESENCE), 
      `${presenceData.userId}_${presenceData.documentId}`
    );
    await setDoc(presenceRef, {
      ...presenceData,
      lastActive: serverTimestamp(),
      isOnline: true
    }, { merge: true });
  }
}

export const databaseService = new DatabaseService(); 