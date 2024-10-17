
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('./db/collaborative_text_editor.db');

app.get('/api/documents', (req, res) => {
  db.all('SELECT * FROM documents', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ documents: rows });
  });
});

app.post('/api/documents', (req, res) => {
  const { title } = req.body;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  db.run(
    'INSERT INTO documents (title, createdAt, updatedAt) VALUES (?, ?, ?)',
    [title, createdAt, updatedAt],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, title, createdAt, updatedAt });
    }
  );
});

const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Server running at http://localhost:${port}`);
  });
});
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'documentUpdate':
        // Broadcast document update to all clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
      case 'chatMessage':
        // Broadcast chat message to all clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
      case 'userPresence':
        // Broadcast user presence update to all clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


