import WebSocket from 'ws';
import { Server } from 'http';
import * as Y from 'yjs';
import config from '../config';
import { WebSocketMessage, SyncMessage } from '@/types/websocket';

export class DocumentWebSocketServer {
  private wss: WebSocket.Server;
  private rooms: Map<string, Set<WebSocket>> = new Map();
  private docs: Map<string, Y.Doc> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const documentId = url.searchParams.get('documentId');

      if (documentId) {
        this.addToRoom(documentId, ws);
        
        if (!this.docs.has(documentId)) {
          this.docs.set(documentId, new Y.Doc());
        }
        
        const doc = this.docs.get(documentId)!;
        
        const update = Y.encodeStateAsUpdate(doc);
        const message: SyncMessage = {
          type: 'sync',
          documentId,
          data: Array.from(update),
          timestamp: Date.now()
        };
        ws.send(JSON.stringify(message));
      }

      ws.on('message', (message: WebSocket.RawData) => {
        try {
          const data = JSON.parse(message.toString()) as WebSocketMessage;
          if (data.type === 'sync' && data.documentId) {
            const syncMessage = data as SyncMessage;
            const doc = this.docs.get(syncMessage.documentId);
            if (doc && syncMessage.data) {
              Y.applyUpdate(doc, new Uint8Array(syncMessage.data));
              this.broadcastToRoom(syncMessage.documentId, syncMessage, ws);
            }
          } else if (data.type === 'awareness') {
            this.broadcastToRoom(data.documentId, data, ws);
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', () => {
        if (documentId) {
          this.removeFromRoom(documentId, ws);
        }
      });
    });
  }

  private addToRoom(documentId: string, ws: WebSocket) {
    if (!this.rooms.has(documentId)) {
      this.rooms.set(documentId, new Set());
    }
    this.rooms.get(documentId)?.add(ws);
  }

  private removeFromRoom(documentId: string, ws: WebSocket) {
    this.rooms.get(documentId)?.delete(ws);
    if (this.rooms.get(documentId)?.size === 0) {
      this.rooms.delete(documentId);
      this.docs.delete(documentId);
    }
  }

  private broadcastToRoom(documentId: string, data: any, sender: WebSocket) {
    const room = this.rooms.get(documentId);
    if (room) {
      room.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  }
}

export function setupWebSocketServer(server: Server) {
  return new DocumentWebSocketServer(server);
} 