
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const DOCUMENTS_DIR = path.join(__dirname, 'documents');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      if (data.type === 'join') {
        const { documentId } = data;
        clients.set(ws, { documentId });
        const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
        try {
          const content = await fs.readFile(documentPath, 'utf-8');
          ws.send(JSON.stringify({ type: 'update', ...JSON.parse(content) }));
        } catch (error) {
          console.error('Error reading document:', error);
        }
      } else if (data.type === 'update') {
        const { documentId, title, content } = data;
        const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
        await fs.writeFile(documentPath, JSON.stringify({ title, content }));

        // Broadcast the update to all clients editing the same document
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN && clients.get(client)?.documentId === documentId) {
            client.send(JSON.stringify({ type: 'update', title, content }));
          }
        });
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });
  });
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  setupWebSocket(server);

  const port = 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
