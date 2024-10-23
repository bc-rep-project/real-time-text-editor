
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { type, apply } = require('ot-text');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const DOCUMENTS_DIR = path.join(__dirname, 'documents');
const SECRET_KEY = 'your-secret-key'; // In a real application, this should be stored securely

// Mock user database (replace with a real database in production)
const users = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();
  const documents = new Map();

  wss.on('connection', (ws) => {
    console.log('New client connected');
    let pingInterval;

    const sendPing = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    };

    pingInterval = setInterval(sendPing, 30000);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        if (data.type === 'join') {
          const { documentId } = data;
          clients.set(ws, { documentId });
          const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
          try {
            const content = await fs.readFile(documentPath, 'utf-8');
            const { title, content: documentContent, version, history } = JSON.parse(content);
            documents.set(documentId, { content: documentContent, version, history: history || [] });
            ws.send(JSON.stringify({ type: 'init', title, content: documentContent, version, history: history || [] }));
          } catch (error) {
            console.error('Error reading document:', error);
            documents.set(documentId, { content: '', version: 0, history: [] });
            ws.send(JSON.stringify({ type: 'init', title: '', content: '', version: 0, history: [] }));
          }
        } else if (data.type === 'operation') {
          const { documentId, operation, version, username } = data;
          const document = documents.get(documentId);
          
          if (document && version === document.version) {
            const newContent = apply(document.content, operation);
            document.content = newContent;
            document.version++;
            
            // Add to history
            const historyEntry = {
              version: document.version,
              operation,
              timestamp: new Date().toISOString(),
              username
            };
            document.history.push(historyEntry);
            
            const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
            await fs.writeFile(documentPath, JSON.stringify({
              content: newContent,
              version: document.version,
              history: document.history
            }));

            // Broadcast the operation to all clients editing the same document
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && clients.get(client)?.documentId === documentId) {
                client.send(JSON.stringify({ type: 'operation', operation, version: document.version, historyEntry }));
              }
            });
          } else {
            console.error('Version mismatch or document not found');
            ws.send(JSON.stringify({ type: 'error', message: 'Version mismatch or document not found' }));
          }
        } else if (data.type === 'updateTitle') {
          const { documentId, title, username } = data;
          const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
          const document = documents.get(documentId);
          if (document) {
            document.version++;
            const historyEntry = {
              version: document.version,
              title,
              timestamp: new Date().toISOString(),
              username
            };
            document.history.push(historyEntry);
            
            await fs.writeFile(documentPath, JSON.stringify({
              content: document.content,
              version: document.version,
              history: document.history,
              title
            }));

            // Broadcast the title update to all clients editing the same document
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && clients.get(client)?.documentId === documentId) {
                client.send(JSON.stringify({ type: 'updateTitle', title, version: document.version, historyEntry }));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(pingInterval);
      clients.delete(ws);
    });

    ws.on('pong', () => {
      // Handle pong response
    });
  });
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  setupWebSocket(server);

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
