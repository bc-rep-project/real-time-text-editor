import { WebSocketClient } from '../types/client';
import { Message, CursorUpdate } from '../types/message';
import { logger } from '../utils/logger';
import { WebSocketServer } from 'ws';

export class CursorHandler {
  private documentCursors: Map<string, Map<string, CursorUpdate>> = new Map();

  public handleMessage(client: WebSocketClient, message: Message) {
    try {
      const cursorUpdate = message.data as CursorUpdate;
      this.updateCursor(message.documentId, client.userId, cursorUpdate);
      this.broadcastCursorUpdate(message.documentId, client.userId, cursorUpdate);
    } catch (error) {
      logger.error('Error handling cursor update:', error);
    }
  }

  private updateCursor(documentId: string, userId: string, cursor: CursorUpdate) {
    if (!this.documentCursors.has(documentId)) {
      this.documentCursors.set(documentId, new Map());
    }
    this.documentCursors.get(documentId)!.set(userId, cursor);
  }

  private broadcastCursorUpdate(documentId: string, senderId: string, cursor: CursorUpdate) {
    const message = {
      type: 'cursor_update',
      documentId,
      userId: senderId,
      data: cursor,
      timestamp: Date.now()
    };

    // Broadcast to all clients except sender
    this.documentCursors.get(documentId)?.forEach((_, userId) => {
      if (userId !== senderId) {
        const client = this.findClientByUserId(userId);
        if (client?.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      }
    });
  }

  private findClientByUserId(userId: string): WebSocketClient | undefined {
    return Array.from(this.getWebSocketServer().clients)
      .find(client => (client as WebSocketClient).userId === userId) as WebSocketClient;
  }

  private getWebSocketServer(): WebSocketServer {
    return (global as any).wss;
  }
} 