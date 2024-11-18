export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Version {
  id: string;
  documentId: string;
  content: string;
  userId: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  message: string;
  createdAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  userId: string;
  createdAt: Date;
} 