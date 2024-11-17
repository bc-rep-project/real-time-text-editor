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
  serverTimestamp,
  DocumentData,
  getDocs,
  orderBy as firestoreOrderBy
} from 'firebase/firestore';
import { COLLECTIONS, Document, User, UserPresence } from '@/types/database';

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
  async createDocument(documentData: Partial<Document>, userId: string): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required to create a document');
    }

    const docRef = doc(collection(db, COLLECTIONS.DOCUMENTS));
    const newDocument = {
      ...documentData,
      id: docRef.id,
      userId: userId,
      content: documentData.content || '',
      title: documentData.title || 'Untitled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, newDocument);
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

  // Add method to fetch documents
  async getAllDocuments(filter?: string, sort: string = 'updatedAt') {
    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS);
    let q = query(documentsRef);

    if (filter) {
      q = query(q, where('title', '>=', filter));
    }

    q = query(q, firestoreOrderBy(sort === 'title' ? 'title' : 'updatedAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}

export const databaseService = new DatabaseService(); 