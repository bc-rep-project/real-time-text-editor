import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { IncomingMessage } from 'http';
import { validateMessage } from './utils/validator';
import { WebSocketHandler } from './handlers/websocket';

interface WebSocketClient extends WebSocket {
  documentId?: string;
  isAlive?: boolean;
}

export class DocumentWebSocketServer {
  private wss: WebSocketServer;
  private handler: WebSocketHandler;
  private pingInterval: NodeJS.Timeout;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.handler = new WebSocketHandler();
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Set up ping interval
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const wsClient = ws as WebSocketClient;
        if (wsClient.isAlive === false) {
          wsClient.terminate();
          return;
        }
        wsClient.isAlive = false;
        wsClient.ping();
      });
    }, 30000);
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      const { query } = parse(request.url || '', true);
      const documentId = query.documentId as string;
      const token = query.token as string;

      if (!documentId || !token) {
        console.error('Missing documentId or token');
        ws.close(1002, 'Missing documentId or token');
        return;
      }

      // Add client to document room
      const wsClient = ws as WebSocketClient;
      wsClient.documentId = documentId;
      wsClient.isAlive = true;

      ws.on('pong', () => {
        wsClient.isAlive = true;
      });

      ws.on('message', (data) => this.handler.handleMessage(wsClient, data));
      ws.on('close', () => this.handler.handleDisconnect(wsClient));

    } catch (error) {
      console.error('Connection error:', error);
      ws.close(1011, 'Internal Server Error');
    }
  }

  public close() {
    console.log('Closing WebSocket server...');
    clearInterval(this.pingInterval);
    this.wss.close();
  }

  public getConnectedClients(): number {
    return this.wss.clients.size;
  }
} 