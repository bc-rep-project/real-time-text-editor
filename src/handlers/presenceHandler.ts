import { Message } from '../types/message';
import { logger } from '../utils/logger';
import { WebSocketServer } from 'ws';
import type { WebSocketClient as WSClient, UserPresence as WSUserPresence } from '../types/client';

export class PresenceHandler {
  private documentPresence: Map<string, Map<string, WSUserPresence>> = new Map();

  public handleMessage(client: WSClient, message: Message) {
    try {
      const { documentId } = message;
      if (!client.username) {
        throw new Error('Client username is required');
      }
      this.updatePresence(documentId, client);
      this.broadcastPresence(documentId);
    } catch (error) {
      logger.error('Error handling presence update:', error);
    }
  }

  public handleDisconnect(client: WSClient) {
    if (client.documentId) {
      this.removeUserPresence(client.documentId, client.userId);
      this.broadcastPresence(client.documentId);
    }
  }

  private updatePresence(documentId: string, client: WSClient) {
    if (!this.documentPresence.has(documentId)) {
      this.documentPresence.set(documentId, new Map());
    }

    if (!client.username) {
      throw new Error('Client username is required for presence update');
    }

    const presence = this.documentPresence.get(documentId)!;
    presence.set(client.userId, {
      userId: client.userId,
      username: client.username,
      documentId,
      lastActivity: new Date()
    });
  }

  private removeUserPresence(documentId: string, userId: string) {
    const presence = this.documentPresence.get(documentId);
    if (presence) {
      presence.delete(userId);
      if (presence.size === 0) {
        this.documentPresence.delete(documentId);
      }
    }
  }

  private broadcastPresence(documentId: string) {
    const presence = this.documentPresence.get(documentId);
    if (!presence) return;

    const presenceList = Array.from(presence.values());
    const message = {
      type: 'presence_update',
      documentId,
      data: { users: presenceList },
      timestamp: Date.now()
    };

    // Broadcast to all clients in the document
    presence.forEach((_, userId) => {
      const client = Array.from(this.getClients()).find(c => c.userId === userId);
      if (client?.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private getClients(): Set<WSClient> {
    return new Set(Array.from(this.documentPresence.values())
      .flatMap(presence => Array.from(presence.keys()))
      .map(userId => Array.from(this.getWebSocketServer().clients)
        .find(client => (client as WSClient).userId === userId))
      .filter((client): client is WSClient => client !== undefined));
  }

  private getWebSocketServer(): WebSocketServer {
    // This should be injected or accessed through a singleton
    return (global as any).wss;
  }
} 