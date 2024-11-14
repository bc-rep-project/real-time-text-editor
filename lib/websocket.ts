import { WebSocket, WebSocketServer, Server } from 'ws';
import { Server as HttpServer } from 'http';
import type { WebSocketClient } from '@/types/websocket';
import { adminDb } from './firebase-admin';

export class DocumentWebSocketServer {
  private wss: WebSocketServer;
  private pingInterval!: NodeJS.Timeout;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
    console.log(`WebSocket server initialized on port ${port}`);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient, req) => {
      const origin = req.headers.origin;
      if (origin && !ALLOWED_ORIGINS.includes(origin)) {
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
      console.log('Received message:', message.type);

      if (message.type === 'documentUpdate') {
        await adminDb.collection('documents')
          .doc(message.documentId)
          .update({
            content: message.content,
            updatedAt: new Date()
          });
      }

      this.broadcastMessage(ws, message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
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

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[]; 