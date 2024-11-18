import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { WebSocketHandler } from './handlers/websocket';
import { validateMessage } from './utils/validator';
import { config } from './config';

export class DocumentWebSocketServer {
  private wss: WebSocketServer;
  private handler: WebSocketHandler;
  private heartbeatInterval: NodeJS.Timeout;

  constructor(port: number) {
    this.wss = new WebSocketServer({ 
      port,
      perMessageDeflate: false,
      clientTracking: true,
      maxPayload: config.websocket.maxMessageSize,
      handleProtocols: () => 'editor-protocol'
    });

    this.handler = new WebSocketHandler();

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));

    // Start heartbeat
    this.heartbeatInterval = setInterval(
      this.checkConnections.bind(this), 
      config.websocket.heartbeatInterval
    );

    console.log(`WebSocket server is running on port ${port}`);
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      const { query } = parse(request.url || '', true);
      const documentId = query.documentId as string;

      if (!documentId) {
        console.error('No documentId provided');
        ws.close(1002, 'No documentId provided');
        return;
      }

      // Add client to document room
      this.handler.addClient(documentId, ws);

      // Set up ping-pong
      (ws as any).isAlive = true;
      ws.on('pong', () => {
        (ws as any).isAlive = true;
      });

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = validateMessage(JSON.parse(data.toString()));
          if (!message) {
            console.warn('Invalid message format');
            return;
          }

          switch (message.type) {
            case 'userPresence':
              this.handler.handleUserPresence(ws, message);
              break;
            case 'documentUpdate':
              this.handler.handleDocumentUpdate(ws, message);
              break;
            case 'chatMessage':
              this.handler.handleChatMessage(ws, message);
              break;
            default:
              console.warn('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handler.removeClient(documentId, ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close(1011, 'Internal Server Error');
      });

    } catch (error) {
      console.error('Error in connection handler:', error);
      ws.close(1011, 'Internal Server Error');
    }
  }

  private checkConnections() {
    this.wss.clients.forEach((ws: WebSocket) => {
      if ((ws as any).isAlive === false) {
        return ws.terminate();
      }
      
      (ws as any).isAlive = false;
      ws.ping();
    });
  }

  private handleError(error: Error) {
    console.error('WebSocket server error:', error);
  }

  public async close() {
    clearInterval(this.heartbeatInterval);
    
    return new Promise<void>((resolve) => {
      this.wss.close(() => {
        console.log('WebSocket server closed');
        resolve();
      });
    });
  }

  public getConnectedClients(): number {
    return this.wss.clients.size;
  }

  public broadcast(message: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
} 