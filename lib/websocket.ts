import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import type { WebSocketClient } from '@/types/websocket';
import { adminDb } from './firebase-admin';
import { getToken } from 'next-auth/jwt';
import { parse } from 'cookie';
import type { IncomingMessage } from 'http';

interface ExtendedIncomingMessage extends IncomingMessage {
  cookies: { [key: string]: string };
}

export class DocumentWebSocketServer {
  private wss: WebSocketServer;
  private pingInterval!: NodeJS.Timeout;
  private cursorPositions: Map<string, Map<string, any>> = new Map(); // documentId -> Map of userId -> position

  constructor(port: number) {
    this.wss = new WebSocketServer({ 
      port,
      verifyClient: async ({ req }, done) => {
        try {
          // Parse cookies from header
          const cookieHeader = req.headers.cookie || '';
          const cookies = parse(cookieHeader);
          
          // Extend request with cookies
          const extendedReq = Object.assign(req, { cookies }) as ExtendedIncomingMessage;
          
          const token = await getToken({ 
            req: extendedReq, 
            secret: process.env.NEXTAUTH_SECRET 
          });

          if (!token) {
            done(false, 401, 'Unauthorized');
            return;
          }
          done(true);
        } catch (error) {
          console.error('WebSocket auth error:', error);
          done(false, 500, 'Internal Server Error');
        }
      }
    });
    this.setupWebSocketServer();
    console.log(`WebSocket server initialized on port ${port}`);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient, req) => {
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:3000',
        'https://real-time-text-editor-amber.vercel.app',
        'https://real-time-text-editor-git-bug-cee6e5-johanns-projects-6ef4f9e7.vercel.app'
      ];

      if (origin && !allowedOrigins.includes(origin)) {
        console.log(`Rejected connection from unauthorized origin: ${origin}`);
        ws.close();
        return;
      }

      ws.isAlive = true;
      console.log('Client connected');

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (data) => {
        try {
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });

    this.setupPingInterval();
  }

  private setupPingInterval() {
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((client: WebSocket) => {
        const wsClient = client as WebSocketClient;
        if (!wsClient.isAlive) {
          console.log('Client disconnected due to inactivity');
          this.handleDisconnect(wsClient);
          return;
        }
        wsClient.isAlive = false;
        wsClient.ping();
      });
    }, 30000);
  }

  private async handleMessage(ws: WebSocketClient, data: Buffer | ArrayBuffer | Buffer[]) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'documentUpdate':
          await this.handleDocumentUpdate(ws, message);
          break;
        case 'cursorMove':
          await this.handleCursorMove(ws, message);
          break;
        case 'selection':
          await this.handleSelection(ws, message);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private async handleDocumentUpdate(ws: WebSocketClient, message: any) {
    const { documentId, content } = message;
    await adminDb.collection('documents')
      .doc(documentId)
      .update({
        content: content,
        updatedAt: new Date()
      });
    this.broadcastMessage(ws, message);
  }

  private async handleCursorMove(ws: WebSocketClient, message: any) {
    const { documentId, position, userId } = message;
    let docCursors = this.cursorPositions.get(documentId) || new Map();
    docCursors.set(userId, position);
    this.cursorPositions.set(documentId, docCursors);
    
    this.broadcastMessage(ws, {
      type: 'cursorUpdate',
      documentId,
      cursors: Object.fromEntries(docCursors)
    });
  }

  private async handleSelection(ws: WebSocketClient, message: any) {
    const { documentId, selection } = message;
    this.broadcastMessage(ws, {
      type: 'selection',
      documentId,
      data: { selection }
    });
  }

  private broadcastMessage(sender: WebSocketClient, message: any) {
    this.wss.clients.forEach((client: WebSocket) => {
      const wsClient = client as WebSocketClient;
      if (wsClient !== sender && 
          wsClient.readyState === WebSocket.OPEN && 
          wsClient.documentId === sender.documentId) {
        wsClient.send(JSON.stringify(message));
      }
    });
  }

  private handleDisconnect(ws: WebSocketClient) {
    console.log('Client disconnected');
    ws.terminate();
  }

  public close() {
    console.log('Closing WebSocket server...');
    clearInterval(this.pingInterval);
    this.wss.close();
  }
}

export function createWebSocketConnection(documentId: string) {
  const wsUrl = new URL(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081');
  wsUrl.searchParams.set('documentId', documentId);
  wsUrl.searchParams.set('token', localStorage.getItem('next-auth.session-token') || '');
  
  const ws = new WebSocket(wsUrl.toString());
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected, attempting to reconnect...');
    setTimeout(() => createWebSocketConnection(documentId), 1000);
  };

  return ws;
} 