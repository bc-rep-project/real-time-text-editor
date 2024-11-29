export type MessageType = 
  | 'document_update'
  | 'cursor_update'
  | 'presence_update'
  | 'chat_message'
  | 'error';

export interface Message {
  type: MessageType;
  documentId: string;
  userId: string;
  data: any;
  timestamp: number;
}

export interface DocumentUpdate {
  content: string;
  version: number;
  patches?: any[];
}

export interface CursorUpdate {
  index: number;
  length: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  username: string;
} 