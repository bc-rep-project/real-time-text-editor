import { WebSocketClient } from '../types/client';
import { Message, ChatMessage } from '../types/message';
import { logger } from '../utils/logger';

export class ChatHandler {
  private chatRooms: Map<string, Set<WebSocketClient>> = new Map();

  public handleMessage(client: WebSocketClient, message: Message) {
    try {
      const chatMessage = message.data as ChatMessage;
      this.broadcastToRoom(message.documentId, {
        ...message,
        data: {
          ...chatMessage,
          username: client.username,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error handling chat message:', error);
      this.sendError(client, 'Failed to process chat message');
    }
  }

  public joinRoom(documentId: string, client: WebSocketClient) {
    if (!this.chatRooms.has(documentId)) {
      this.chatRooms.set(documentId, new Set());
    }
    this.chatRooms.get(documentId)?.add(client);
  }

  public leaveRoom(documentId: string, client: WebSocketClient) {
    this.chatRooms.get(documentId)?.delete(client);
    if (this.chatRooms.get(documentId)?.size === 0) {
      this.chatRooms.delete(documentId);
    }
  }

  private broadcastToRoom(documentId: string, message: Message) {
    const clients = this.chatRooms.get(documentId);
    if (!clients) return;

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private sendError(client: WebSocketClient, message: string) {
    client.send(JSON.stringify({
      type: 'error',
      data: { message }
    }));
  }
} 