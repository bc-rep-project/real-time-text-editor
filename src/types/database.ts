import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPresence {
  userId: string;
  documentId: string;
  lastActive: Timestamp;
  isOnline: boolean;
}

export const COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  USER_PRESENCE: 'userPresence'
} as const; 