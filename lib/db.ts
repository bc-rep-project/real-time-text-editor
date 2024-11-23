import { adminDb } from './firebase-admin';
import { 
  DocumentData, 
  Query,
  CollectionReference,
  WhereFilterOp,
  OrderByDirection,
  WriteBatch
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
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Safely handle timestamp conversions
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        } as T;
      });
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

  // Add mergeUpdates method
  mergeUpdates(currentData: any, newData: any): any {
    if (!currentData) return newData;
    
    const merged = { ...currentData };
    
    // Merge arrays if they exist
    Object.keys(newData).forEach(key => {
      if (Array.isArray(currentData[key]) && Array.isArray(newData[key])) {
        merged[key] = [...new Set([...currentData[key], ...newData[key]])];
      } else if (typeof currentData[key] === 'object' && typeof newData[key] === 'object') {
        merged[key] = this.mergeUpdates(currentData[key], newData[key]);
      } else {
        merged[key] = newData[key];
      }
    });
    
    return merged;
  },

  // Update existing document with retry and merge
  async update(collection: string, id: string, data: any): Promise<void> {
    return this.retryOperation(async () => {
      const ref = adminDb.collection(collection).doc(id);
      await adminDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(ref);
        if (!doc.exists) {
          throw new Error('Document does not exist');
        }
        
        // Merge changes with existing data
        const currentData = doc.data();
        const mergedData = this.mergeUpdates(currentData, data);
        
        transaction.update(ref, {
          ...mergedData,
          updatedAt: new Date()
        });
      });
    });
  },

  // Delete a document
  async delete(collection: string, id: string): Promise<void> {
    try {
      await adminDb.collection(collection).doc(id).delete();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Add these new methods
  createBatch(): WriteBatch {
    return adminDb.batch();
  },

  collection(collectionName: string) {
    return adminDb.collection(collectionName);
  },

  doc(collectionName: string, docId: string) {
    return adminDb.collection(collectionName).doc(docId);
  },

  // Add retry mechanism for failed operations
  async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw lastError;
  }
}; 