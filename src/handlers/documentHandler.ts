import { WebSocketClient } from '../types/client';
import { Message, DocumentUpdate } from '../types/message';
import { documentService } from '../services/documentService';
import { logger } from '../utils/logger';

export class DocumentHandler {
  private clients: Map<string, Set<WebSocketClient>> = new Map();

  public handleMessage(client: WebSocketClient, message: Message) {
    switch (message.type) {
      case 'document_update':
        this.handleDocumentUpdate(client, message);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  private handleDocumentUpdate(client: WebSocketClient, message: Message) {
    try {
      const update = message.data as DocumentUpdate;
      documentService.saveUpdate(message.documentId, update);
      this.broadcastToDocument(message.documentId, message, client.id);
    } catch (error) {
      logger.error('Error handling document update:', error);
      this.sendError(client, 'Failed to process document update');
    }
  }

  private broadcastToDocument(documentId: string, message: Message, excludeClientId?: string) {
    const clients = this.clients.get(documentId);
    if (!clients) return;

    clients.forEach(client => {
      if (client.id !== excludeClientId && client.readyState === WebSocket.OPEN) {
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