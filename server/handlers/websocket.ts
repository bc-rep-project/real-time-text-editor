import { WebSocket } from 'ws';
import {
  WebSocketClient,
  WebSocketMessage,
  MessageType,
  isPresenceData,
  isDocumentUpdateData,
  isChatMessageData,
  isTypingIndicatorData,
  isSelectionData
} from '../types';
import { validateMessage } from '../utils/validator';

export class WebSocketHandler {
  private documentClients: Map<string, Set<WebSocketClient>>;
  private typingUsers: Map<string, Set<string>> = new Map(); // documentId -> Set of usernames

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

    // Add read receipts
    const enrichedMessage = {
      ...message,
      data: {
        ...message.data,
        readBy: [client.userId],
        timestamp: new Date().toISOString()
      }
    };

    this.broadcastToDocument(message.documentId, enrichedMessage, client);
  }

  // Add typing indicator handler
  public handleTypingIndicator(client: WebSocketClient, message: WebSocketMessage) {
    if (!isTypingIndicatorData(message.data)) {
      console.error('Invalid typing indicator data');
      return;
    }

    const { documentId } = message;
    const typingUsers = message.data.typingUsers || [];
    
    this.typingUsers.set(documentId, new Set(typingUsers));
    
    this.broadcastToDocument(documentId, {
      type: 'typingIndicator',
      documentId,
      data: { 
        typingUsers: Array.from(this.typingUsers.get(documentId) || new Set())
      }
    });
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

  public handleMessage(client: WebSocketClient, data: Buffer | ArrayBuffer | Buffer[]) {
    try {
      const message = validateMessage(JSON.parse(data.toString()));
      if (!message) {
        console.error('Invalid message format');
        return;
      }

      if (client.documentId) {
        this.addClient(client.documentId, client);
      }

      const handlers: Record<MessageType, (client: WebSocketClient, message: WebSocketMessage) => void> = {
        userPresence: this.handleUserPresence.bind(this),
        documentUpdate: this.handleDocumentUpdate.bind(this),
        chatMessage: this.handleChatMessage.bind(this),
        typingIndicator: this.handleTypingIndicator.bind(this),
        selection: this.handleSelection.bind(this)
      };

      const handler = handlers[message.type];
      if (handler) {
        handler(client, message);
      } else {
        console.error('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleSelection(client: WebSocketClient, message: WebSocketMessage) {
    if (!isSelectionData(message.data)) {
      console.error('Invalid selection data');
      return;
    }
    this.broadcastToDocument(message.documentId, message, client);
  }

  public handleDisconnect(client: WebSocketClient) {
    if (client.documentId) {
      this.removeClient(client.documentId, client);
    }
  }
} 