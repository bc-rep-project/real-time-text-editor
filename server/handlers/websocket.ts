import { WebSocket } from 'ws';
import {
  WebSocketClient,
  WebSocketMessage,
  isPresenceData,
  isDocumentUpdateData,
  isChatMessageData
} from '../types';

export class WebSocketHandler {
  private documentClients: Map<string, Set<WebSocketClient>>;

  constructor() {
    this.documentClients = new Map();
  }

  public addClient(documentId: string, client: WebSocketClient) {
    if (!this.documentClients.has(documentId)) {
      this.documentClients.set(documentId, new Set());
    }
    this.documentClients.get(documentId)?.add(client);
  }

  public removeClient(documentId: string, client: WebSocketClient) {
    const clients = this.documentClients.get(documentId);
    if (clients) {
      // Send leave message if client had presence
      if (client.userId && client.username) {
        this.broadcastToDocument(documentId, {
          type: 'userPresence',
          documentId,
          data: {
            userId: client.userId,
            username: client.username,
            action: 'leave'
          }
        }, client);
      }

      clients.delete(client);
      if (clients.size === 0) {
        this.documentClients.delete(documentId);
      }
    }
  }

  public handleUserPresence(client: WebSocketClient, message: WebSocketMessage) {
    if (!isPresenceData(message.data)) {
      console.error('Invalid presence data');
      return;
    }

    const { documentId } = message;
    const { userId, username, action } = message.data;

    if (action === 'join') {
      client.userId = userId;
      client.username = username;
    }

    this.broadcastToDocument(documentId, message, client);
  }

  public handleDocumentUpdate(client: WebSocketClient, message: WebSocketMessage) {
    if (!isDocumentUpdateData(message.data)) {
      console.error('Invalid document update data');
      return;
    }

    this.broadcastToDocument(message.documentId, message, client);
  }

  public handleChatMessage(client: WebSocketClient, message: WebSocketMessage) {
    if (!isChatMessageData(message.data)) {
      console.error('Invalid chat message data');
      return;
    }

    this.broadcastToDocument(message.documentId, message, client);
  }

  private broadcastToDocument(documentId: string, message: WebSocketMessage, excludeClient?: WebSocketClient) {
    const clients = this.documentClients.get(documentId);
    if (!clients) return;

    const messageString = JSON.stringify(message);
    clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  public getClientsInDocument(documentId: string): Set<WebSocketClient> {
    return this.documentClients.get(documentId) || new Set();
  }

  public getAllClients(): number {
    let total = 0;
    for (const clients of this.documentClients.values()) {
      total += clients.size;
    }
    return total;
  }
} 