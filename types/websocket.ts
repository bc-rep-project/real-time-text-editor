import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
  documentId?: string;
  userId?: string;
  username?: string;
}

export type MessageType = 'userPresence' | 'documentUpdate' | 'chatMessage' | 'typingIndicator' | 'selection';

export interface TypingIndicatorData {
  documentId: string;
  username: string;
  isTyping: boolean;
}

export interface SelectionData {
  range: {
    from: number;
    to: number;
  };
  userId: string;
  username: string;
}

export type WebSocketMessageData = 
  | { type: 'userPresence'; userId: string; username: string; action: 'join' | 'leave' }
  | { type: 'documentUpdate'; content: string }
  | { type: 'chatMessage'; message: string; userId: string; username: string }
  | { type: 'typingIndicator'; typingUsers: string[] }
  | { type: 'selection'; selection: SelectionData };

export interface WebSocketMessage {
  type: MessageType;
  documentId: string;
  data: WebSocketMessageData;
} 