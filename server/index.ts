import express from 'express';
import { DocumentWebSocketServer } from '../lib/websocket';
import { config } from 'dotenv';

// Load environment variables
config();

// Parse port as number
const PORT = parseInt(process.env.PORT || '8080', 10);

// Create express app for health checks
const app = express();

// Health check endpoint
app.get('/health', (_: express.Request, res: express.Response) => {
  res.send('OK');
});

// Create WebSocket server
const wss = new DocumentWebSocketServer(PORT);

// Start express server
const server = app.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('Shutting down...');
  wss.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown); 