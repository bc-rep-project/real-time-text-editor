import { DocumentWebSocketServer } from '@/lib/websocket';
import express from 'express';

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
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing WebSocket server...');
  wss.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing WebSocket server...');
  wss.close();
  process.exit(0);
}); 