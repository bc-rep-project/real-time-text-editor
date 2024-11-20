import { adminDb } from './firebase-admin';
import { 
  DocumentData, 
  Query,
  CollectionReference,
  WhereFilterOp,
  OrderByDirection
} from 'firebase-admin/firestore';

interface WhereClause {
  field: string;
  op: WhereFilterOp;
  value: any;
}

interface QueryOptions {
  where?: WhereClause[];
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
    try {
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
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  },

  // Query documents with filters and ordering
  async query<T>(collection: string, options: QueryOptions = {}): Promise<T[]> {
    try {
      let query: Query<DocumentData> | CollectionReference<DocumentData> = adminDb.collection(collection);

      if (options.where) {
        options.where.forEach(clause => {
          query = query.where(
            clause.field,
            clause.op,
            clause.value
          );
        });
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
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as T[];
    } catch (error) {
      console.error('Error querying documents:', error);
      return [];
    }
  },

  // Create a new document
  async add(collection: string, data: any): Promise<string> {
    try {
      const doc = await adminDb.collection(collection).add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return doc.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  // Update an existing document
  async update(collection: string, id: string, data: any): Promise<void> {
    try {
      await adminDb.collection(collection).doc(id).update({
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async delete(collection: string, id: string): Promise<void> {
    try {
      await adminDb.collection(collection).doc(id).delete();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}; 