import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
  documentId?: string;
  userId?: string;
  username?: string;
}

export type MessageType = 'documentUpdate' | 'userPresence' | 'chatMessage' | 'typingIndicator' | 'selection';

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
  data: {
    type: MessageType;
    content?: string;
    userId?: string;
    username?: string;
    action?: 'join' | 'leave';
    selection?: {
      from: number;
      to: number;
    };
  };
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  selection: {
    from: number;
    to: number;
  };
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  replies: CommentReply[];
}

export type MessageHandler = (event: { data: string }) => void; 