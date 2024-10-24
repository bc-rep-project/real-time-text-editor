const express = require('express');
const next = require('next');
const multer = require('multer');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const wss = new WebSocket.Server({ server: httpServer });

  // Set up multer for file uploads
  const upload = multer({
    dest: path.join(__dirname, 'public', 'uploads'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  // Handle file uploads
  server.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      console.log('Received:', message);
      // Handle the message (e.g., broadcast to other clients)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3002;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
