import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  id: string;
  userId: string;
  username?: string;
  isAlive: boolean;
  lastActivity: Date;
  documentId?: string;
}

export interface UserPresence {
  userId: string;
  username: string;
  documentId: string;
  cursorPosition?: {
    index: number;
    length: number;
  };
  lastActivity: Date;
} 