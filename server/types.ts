import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  documentId?: string;
  userId?: string;
  username?: string;
  isAlive?: boolean;
}

export interface SelectionData {
  range: {
    from: number;
    to: number;
  };
  userId: string;
  username: string;
}

export interface PresenceData {
  userId: string;
  username: string;
  action: 'join' | 'leave';
}

export interface DocumentUpdateData {
  content: string;
}

export interface ChatMessageData {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
}

export interface TypingIndicatorData {
  typingUsers: string[];
}

export interface SelectionUpdateData {
  selection: SelectionData;
}

// Union type for all possible message data types
export type WebSocketMessageData = 
  | PresenceData 
  | DocumentUpdateData 
  | ChatMessageData 
  | TypingIndicatorData 
  | SelectionUpdateData;

// Message types
export type MessageType = 'userPresence' | 'documentUpdate' | 'chatMessage' | 'typingIndicator' | 'selection';

export interface WebSocketMessage {
  type: MessageType;
  documentId: string;
  data: WebSocketMessageData;
}

// Type guards
export function isPresenceData(data: WebSocketMessageData): data is PresenceData {
  return 'action' in data && ('join' === data.action || 'leave' === data.action);
}

export function isDocumentUpdateData(data: WebSocketMessageData): data is DocumentUpdateData {
  return 'content' in data && !('message' in data);
}

export function isChatMessageData(data: WebSocketMessageData): data is ChatMessageData {
  return 'message' in data && 'createdAt' in data;
}

export function isTypingIndicatorData(data: WebSocketMessageData): data is TypingIndicatorData {
  return 'typingUsers' in data;
}

export function isSelectionData(data: WebSocketMessageData): data is SelectionUpdateData {
  return 'selection' in data;
} 