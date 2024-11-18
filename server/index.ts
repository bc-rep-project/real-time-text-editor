import express from 'express';
import { DocumentWebSocketServer } from '../lib/websocket';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import config from '../config';

// Load environment variables from .env file in development
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8081', 10);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
const wss = new DocumentWebSocketServer(server);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

export default server; 