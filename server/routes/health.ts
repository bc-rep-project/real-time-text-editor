import express from 'express';
import { DocumentWebSocketServer } from '../websocket';

export function createHealthRouter(wss: DocumentWebSocketServer) {
  const router = express.Router();

  router.get('/health', (_, res) => {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      connectedClients: wss.getConnectedClients(),
    };

    res.json(status);
  });

  router.get('/metrics', (_, res) => {
    const metrics = {
      connectedClients: wss.getConnectedClients(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };

    res.json(metrics);
  });

  return router;
} 