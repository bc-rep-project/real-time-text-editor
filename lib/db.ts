import { adminDb } from './firebase-admin';
import { 
  DocumentData, 
  Query,
  CollectionReference,
  WhereFilterOp,
  OrderByDirection
} from 'firebase-admin/firestore';

interface QueryOptions {
  where?: {
    field: string;
    op: WhereFilterOp;
    value: any;
  };
  orderBy?: {
    field: string;
    direction: OrderByDirection;
  };
  limit?: number;
}

export const db = {
  // Get a single document by ID or query
  async get<T>(
    collection: string, 
    idOrQuery: string | { field: string; value: any }
  ): Promise<T | null> {
    if (typeof idOrQuery === 'string') {
      const doc = await adminDb.collection(collection).doc(idOrQuery).get();
      return doc.exists ? { id: doc.id, ...doc.data() } as T : null;
    } else {
      const snapshot = await adminDb.collection(collection)
        .where(idOrQuery.field, '==', idOrQuery.value)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as T;
    }
  },

  // Query documents with filters and ordering
  async query<T>(collection: string, options: QueryOptions = {}): Promise<T[]> {
    let query: Query<DocumentData> | CollectionReference<DocumentData> = adminDb.collection(collection);

    if (options.where) {
      query = query.where(
        options.where.field,
        options.where.op,
        options.where.value
      );
    }

    if (options.orderBy) {
      query = query.orderBy(
        options.orderBy.field,
        options.orderBy.direction
      );
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  },

  // Create a new document
  async add(collection: string, data: any): Promise<string> {
    const doc = await adminDb.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return doc.id;
  },

  // Update an existing document
  async update(collection: string, id: string, data: any): Promise<void> {
    await adminDb.collection(collection).doc(id).update({
      ...data,
      updatedAt: new Date()
    });
  },

  // Delete a document
  async delete(collection: string, id: string): Promise<void> {
    await adminDb.collection(collection).doc(id).delete();
  }
}; 