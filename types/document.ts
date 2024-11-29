export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  collaborators: {
    userId: string;
    role: 'editor' | 'viewer';
  }[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  selection: {
    start: number;
    end: number;
    text: string;
  };
} 