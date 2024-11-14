import express from 'express';
import { DocumentWebSocketServer } from '../lib/websocket';
import * as dotenv from 'dotenv';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Parse port as number
const PORT = parseInt(process.env.PORT || '8080', 10);

// Create express app for health checks
const app = express();

// Health check endpoint
app.get('/health', (_: express.Request, res: express.Response) => {
  res.send('OK');
});

// Start express server
app.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

// Initialize WebSocket server
const wss = new DocumentWebSocketServer(PORT + 1);

// Handle graceful shutdown
const shutdown = () => {
  console.log('Shutting down...');
  wss.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown); 