export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface UserPresence {
  userId: string;
  documentId: string;
  lastActive: FirebaseFirestore.Timestamp;
  isOnline: boolean;
}

// Collection names as constants
export const COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  USER_PRESENCE: 'userPresence'
} as const; 