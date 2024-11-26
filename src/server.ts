import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { parse } from 'url';
import { config } from './config';
import { DocumentHandler } from './handlers/documentHandler';
import { ChatHandler } from './handlers/chatHandler';
import { PresenceHandler } from './handlers/presenceHandler';
import { CursorHandler } from './handlers/cursorHandler';
import { authService } from './services/authService';
import { logger } from './utils/logger';
import type { WebSocketClient } from './types/client';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const documentHandler = new DocumentHandler();
const chatHandler = new ChatHandler();
const presenceHandler = new PresenceHandler();
const cursorHandler = new CursorHandler();

// Heartbeat interval
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws: WebSocket) => {
    const client = ws as unknown as WebSocketClient;
    if (!client.isAlive) {
      presenceHandler.handleDisconnect(client);
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);

wss.on('connection', async (ws: WebSocketClient, req) => {
  try {
    // Authenticate connection
    const token = parse(req.url || '', true).query.token as string;
    const user = await authService.verifyToken(token);
    if (!user) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    // Set up client
    ws.id = Math.random().toString(36).substr(2, 9);
    ws.userId = user.id;
    ws.username = user.username;
    ws.isAlive = true;
    ws.lastActivity = new Date();

    // Handle messages
    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        ws.lastActivity = new Date();

        switch (message.type) {
          case 'document_update':
            documentHandler.handleMessage(ws, message);
            break;
          case 'chat_message':
            chatHandler.handleMessage(ws, message);
            break;
          case 'presence_update':
            presenceHandler.handleMessage(ws, message);
            break;
          case 'cursor_update':
            cursorHandler.handleMessage(ws, message);
            break;
          default:
            logger.warn(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        logger.error('Error processing message:', error);
      }
    });

    // Handle pong messages
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle disconnection
    ws.on('close', () => {
      presenceHandler.handleDisconnect(ws);
    });

  } catch (error) {
    logger.error('WebSocket connection error:', error);
    ws.close(4000, 'Internal Server Error');
  }
});

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

const PORT = config.port || 3001;
server.listen(PORT, () => {
  logger.info(`WebSocket server running on port ${PORT}`);
}); 