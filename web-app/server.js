
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const dbPromise = open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    const db = await dbPromise;

    switch (data.type) {
      case 'documentUpdate':
        await db.run('UPDATE documents SET content = ?, updatedAt = ? WHERE id = ?', [
          data.content,
          new Date().toISOString(),
          data.documentId
        ]);
        broadcast(data);
        break;
      case 'chatMessage':
        const result = await db.run('INSERT INTO chat_messages (documentId, userId, message, timestamp) VALUES (?, ?, ?, ?)', [
          data.documentId,
          data.userId,
          data.message,
          new Date().toISOString()
        ]);
        const chatMessage = await db.get('SELECT * FROM chat_messages WHERE id = ?', [result.lastID]);
        broadcast({ ...data, chatMessage });
        break;
      case 'userPresence':
        broadcast(data);
        break;
    }
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(3001, () => {
  console.log('WebSocket server is running on port 3001');
});
