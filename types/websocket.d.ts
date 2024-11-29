declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
  }
}

export interface WebSocketClient extends WebSocket {
  userId?: string;
  username?: string;
  documentId?: string;
} 