import { adminDb } from './firebase-admin';
import type { User, Document, Version, ChatMessage } from '@/types/database';

export class DatabaseService {
  // Users Collection
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const userRef = await adminDb.collection('users').add({
      ...userData,
      createdAt: now,
      updatedAt: now
    });
    return userRef.id;
  }

  // Documents Collection
  async createDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await adminDb.collection('documents').add({
      ...documentData,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  // Versions Collection
  async createVersion(versionData: Omit<Version, 'id' | 'createdAt'>): Promise<string> {
    const versionRef = await adminDb.collection('versions').add({
      ...versionData,
      createdAt: new Date()
    });
    return versionRef.id;
  }

  // Chat Messages Collection
  async createChatMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<string> {
    const messageRef = await adminDb.collection('chat_messages').add({
      ...messageData,
      createdAt: new Date()
    });
    return messageRef.id;
  }

  // Query Helpers
  async getDocumentVersions(documentId: string): Promise<Version[]> {
    const versionsSnapshot = await adminDb
      .collection('versions')
      .where('documentId', '==', documentId)
      .orderBy('createdAt', 'desc')
      .get();

    return versionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Version));
  }

  async getDocumentChatMessages(documentId: string, limit = 100): Promise<ChatMessage[]> {
    const messagesSnapshot = await adminDb
      .collection('chat_messages')
      .where('documentId', '==', documentId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
  }

  // Batch Operations
  async createDocumentWithInitialVersion(
    documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<{ documentId: string; versionId: string }> {
    const batch = adminDb.batch();
    
    // Create document reference
    const documentRef = adminDb.collection('documents').doc();
    const now = new Date();
    
    batch.set(documentRef, {
      ...documentData,
      createdAt: now,
      updatedAt: now
    });

    // Create initial version reference
    const versionRef = adminDb.collection('versions').doc();
    batch.set(versionRef, {
      documentId: documentRef.id,
      content: documentData.content,
      userId,
      createdAt: now
    });

    await batch.commit();

    return {
      documentId: documentRef.id,
      versionId: versionRef.id
    };
  }
}

export const databaseService = new DatabaseService(); 