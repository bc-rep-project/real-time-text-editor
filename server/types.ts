import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  documentId?: string;
  userId?: string;
  username?: string;
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

export type WebSocketMessageData = PresenceData | DocumentUpdateData | ChatMessageData;

export interface WebSocketMessage {
  type: 'documentUpdate' | 'chatMessage' | 'userPresence';
  documentId: string;
  data: WebSocketMessageData;
}

export function isPresenceData(data: WebSocketMessageData): data is PresenceData {
  return 'action' in data && ('join' === data.action || 'leave' === data.action);
}

export function isDocumentUpdateData(data: WebSocketMessageData): data is DocumentUpdateData {
  return 'content' in data && !('message' in data);
}

export function isChatMessageData(data: WebSocketMessageData): data is ChatMessageData {
  return 'message' in data && 'createdAt' in data;
} 