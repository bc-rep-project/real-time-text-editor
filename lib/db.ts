import { adminDb } from './firebase-admin';
import { CollectionReference, Query, DocumentData, WhereFilterOp } from 'firebase-admin/firestore';

interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
}

type DocumentType = User | any;

export const db = {
  async query<T extends DocumentType>(
    collection: string,
    where?: { field: string; op: string; value: any }
  ): Promise<T[]> {
    const collectionRef = adminDb.collection(collection);
    let queryRef: Query<DocumentData> = collectionRef;

    if (where) {
      queryRef = queryRef.where(
        where.field,
        where.op as WhereFilterOp,
        where.value
      );
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
  },

  async get<T extends DocumentType>(
    collection: string,
    query: { field: string; value: any }
  ): Promise<T | null> {
    const snapshot = await adminDb.collection(collection)
      .where(query.field, '==', query.value)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  },

  async add(collection: string, data: any): Promise<string> {
    const docRef = await adminDb.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  async update(collection: string, id: string, data: any): Promise<void> {
    await adminDb.collection(collection).doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  },

  async delete(collection: string, id: string): Promise<void> {
    await adminDb.collection(collection).doc(id).delete();
  },

  async all<T extends DocumentType>(
    collection: string,
    options?: {
      orderBy?: { field: string; direction: 'desc' | 'asc' };
      limit?: number;
      where?: { field: string; op: string; value: any };
    }
  ): Promise<T[]> {
    const collectionRef = adminDb.collection(collection);
    let queryRef: Query<DocumentData> = collectionRef;
    
    if (options?.where) {
      queryRef = queryRef.where(
        options.where.field,
        options.where.op as WhereFilterOp,
        options.where.value
      );
    }

    if (options?.orderBy) {
      queryRef = queryRef.orderBy(options.orderBy.field, options.orderBy.direction);
    }

    if (options?.limit) {
      queryRef = queryRef.limit(options.limit);
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
  }
}; 