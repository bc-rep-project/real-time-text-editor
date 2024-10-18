
const WebSocket = require('ws');
const db = require('./database');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.event) {
      case 'documentUpdate':
        db.run('UPDATE documents SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [data.content, data.documentId], (err) => {
          if (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
            return;
          }
          broadcast({ event: 'documentUpdate', documentId: data.documentId, content: data.content });
        });
        break;

      case 'chatMessage':
        db.run('INSERT INTO chat_messages (documentId, userId, message) VALUES (?, ?, ?)', [data.documentId, data.userId, data.message], function(err) {
          if (err) {
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
            return;
          }
          broadcast({ event: 'chatMessage', documentId: data.documentId, userId: data.userId, message: data.message });
        });
        break;

      case 'userPresence':
        broadcast({ event: 'userPresence', documentId: data.documentId, userId: data.userId, status: data.status });
        break;

      default:
        ws.send(JSON.stringify({ event: 'error', message: 'Unknown event' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
