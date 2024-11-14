export interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  message: string;
  createdAt: Date;
}

export interface ChatMessageWithUser extends ChatMessage {
  username: string;
} 