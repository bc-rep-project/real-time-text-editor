export interface BaseWebSocketMessage {
  type: WebSocketMessageType;
  documentId: string;
  timestamp?: number;
}

export interface SyncMessage extends BaseWebSocketMessage {
  type: 'sync';
  data: number[] | null;
}

export interface AwarenessMessage extends BaseWebSocketMessage {
  type: 'awareness';
  clientId: number;
  data: {
    [key: string]: any;
  };
}

export interface ChatMessage extends BaseWebSocketMessage {
  type: 'chatMessage';
  userId: string;
  data: {
    message: string;
    timestamp: string;
  };
}

export type WebSocketMessage = SyncMessage | AwarenessMessage | ChatMessage;

export type WebSocketMessageType = 'sync' | 'awareness' | 'chatMessage';