import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
  username?: string;
  documentId?: string;
} 