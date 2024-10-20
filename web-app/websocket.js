
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('A new client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    handleWebSocketMessage(ws, data);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const handleWebSocketMessage = (ws, data) => {
  switch (data.type) {
    case 'documentUpdate':
      updateDocument(data);
      broadcastMessage(data);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
};

const updateDocument = (data) => {
  db.run('UPDATE documents SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [data.content, data.documentId], (err) => {
    if (err) {
      console.error('Error updating document:', err);
    }
  });
};

const broadcastMessage = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = { server, app };
