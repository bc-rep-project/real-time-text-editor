import express from 'express';
import cors from 'cors';
import { DocumentWebSocketServer } from './websocket';
import { createHealthRouter } from './routes/health';
import * as dotenv from 'dotenv';
import { config } from './config';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

async function startServer() {
  try {
    // Create express app for health checks
    const app = express();

    // Initialize WebSocket server
    const wss = new DocumentWebSocketServer(config.server.wsPort);

    // Add CORS middleware with typed configuration
    app.use(cors({
      origin: config.cors.origin,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      credentials: true, // Allow credentials
      maxAge: 86400, // Cache preflight requests for 24 hours
    }));

    // Add health check routes
    app.use(createHealthRouter(wss));

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      console.log(`HTTP server listening on port ${config.server.port}`);
      console.log(`WebSocket server listening on port ${config.server.wsPort}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down servers...');
      
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('HTTP server closed');
          resolve();
        });
      });

      await wss.close();
      console.log('WebSocket server closed');
      
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
}); 