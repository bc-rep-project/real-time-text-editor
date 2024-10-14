
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const Document = require('./models/Document');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/realtime-text-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    const { documentId, content } = JSON.parse(message);
    const document = await Document.findById(documentId);

    if (document) {
      document.content = content;
      document.version += 1;
      await document.save();
    } else {
      const newDocument = new Document({ content, version: 1 });
      await newDocument.save();
    }

    // Broadcast the message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Express routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/documents/:id', async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (document) {
    res.json(document);
  } else {
    res.status(404).send('Document not found');
  }
});

app.post('/documents', async (req, res) => {
  const newDocument = new Document({ content: 'New Document', version: 1 });
  await newDocument.save();
  res.json(newDocument);
});

app.post('/documents/:id/save', async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (document) {
    document.versions.push({ content: document.content, version: document.version });
    await document.save();
    res.json(document);
  } else {
    res.status(404).send('Document not found');
  }
});

app.get('/documents/:id/versions', async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (document) {
    res.json(document.versions);
  } else {
    res.status(404).send('Document not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
