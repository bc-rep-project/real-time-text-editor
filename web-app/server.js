
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const DOCUMENTS_DIR = path.join(__dirname, 'documents');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SECRET_KEY = 'your-secret-key'; // In a real application, this should be stored securely

// Mock user database (replace with a real database in production)
const users = [];

// Mock messages database (replace with a real database in production)
const messages = {};

// Configure multer for file uploads
const upload = multer({ dest: UPLOADS_DIR });

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

  const broadcastActiveUsers = (documentId) => {
    const activeUsers = Array.from(clients.values())
      .filter(client => client.documentId === documentId)
      .map(client => client.username);
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && clients.get(client)?.documentId === documentId) {
        client.send(JSON.stringify({ type: 'userList', users: activeUsers }));
      }
    });
  };

  const broadcastTypingStatus = (documentId, username, isTyping) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && clients.get(client)?.documentId === documentId) {
        client.send(JSON.stringify({ type: 'typing', username, isTyping }));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      if (data.type === 'join') {
        const { documentId, username } = data;
        clients.set(ws, { documentId, username });
        const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
        try {
          const content = await fs.readFile(documentPath, 'utf-8');
          ws.send(JSON.stringify({ type: 'update', ...JSON.parse(content) }));
        } catch (error) {
          console.error('Error reading document:', error);
        }
        broadcastActiveUsers(documentId);
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
      } else if (data.type === 'chat') {
        const { documentId, sender, text, fileUrl } = data;
        if (!messages[documentId]) {
          messages[documentId] = [];
        }
        const message = { sender, text, fileUrl };
        messages[documentId].push(message);
        
        // Broadcast the chat message to all clients in the same document
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && clients.get(client)?.documentId === documentId) {
            client.send(JSON.stringify({ type: 'message', message }));
          }
        });
      } else if (data.type === 'typing') {
        const { documentId, username, isTyping } = data;
        broadcastTypingStatus(documentId, username, isTyping);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      const client = clients.get(ws);
      if (client) {
        broadcastActiveUsers(client.documentId);
      }
      clients.delete(ws);
    });
  });
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);

    if (parsedUrl.pathname.startsWith('/api/messages/') && req.method === 'GET') {
      const documentId = parsedUrl.pathname.split('/').pop();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(messages[documentId] || []));
    } else if (parsedUrl.pathname === '/api/search' && req.method === 'GET') {
      const { documentId, query } = parsedUrl.query;
      const documentMessages = messages[documentId] || [];
      const searchResults = documentMessages.filter(message => 
        message.text.toLowerCase().includes(query.toLowerCase())
      );
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(searchResults));
    } else if (parsedUrl.pathname === '/api/upload' && req.method === 'POST') {
      upload.single('file')(req, res, (err) => {
        if (err) {
          return res.status(500).json({ error: 'File upload failed' });
        }
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${file.filename}`;
        res.status(200).json({ fileUrl });
      });
    } else if (parsedUrl.pathname === '/api/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const { username, password } = JSON.parse(body);
        if (users.find(u => u.username === username)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Username already exists' }));
        } else {
          const hashedPassword = bcrypt.hashSync(password, 8);
          users.push({ username, password: hashedPassword });
          res.statusCode = 201;
          res.end(JSON.stringify({ message: 'User registered successfully' }));
        }
      });
    } else if (parsedUrl.pathname === '/api/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const { username, password } = JSON.parse(body);
        const user = users.find(u => u.username === username);
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
          res.statusCode = 200;
          res.end(JSON.stringify({ token }));
        } else {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      });
    } else if (parsedUrl.pathname.startsWith('/api/documents/') && req.method === 'GET') {
      const documentId = parsedUrl.pathname.split('/').pop();
      const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
      
      fs.readFile(documentPath, 'utf-8')
        .then(content => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(content);
        })
        .catch(error => {
          console.error('Error reading document:', error);
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Document not found' }));
        });
    } else {
      handle(req, res, parsedUrl);
    }
  });

  setupWebSocket(server);

  const port = process.env.PORT || 3002;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
