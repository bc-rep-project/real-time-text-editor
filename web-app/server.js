
const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const apiRoutes = require('./api');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const wss = new WebSocket.Server({ server: httpServer });

  // Middleware
  server.use(cors());
  server.use(bodyParser.json());

  // Serve static files from the 'public' directory
  server.use(express.static(path.join(__dirname, 'public')));

  // API routes
  server.use('/api', apiRoutes);

  // Next.js request handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      console.log('Received message:', message);
      // Broadcast the message to all clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  });

  const PORT = process.env.PORT || 3003;

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
