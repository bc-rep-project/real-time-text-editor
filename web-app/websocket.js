
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

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
    broadcastUserPresence();
  });
});

const handleWebSocketMessage = (ws, data) => {
  switch (data.type) {
    case 'documentUpdate':
      broadcastMessage(data);
      break;
    case 'chatMessage':
      broadcastMessage(data);
      break;
    case 'userPresence':
      broadcastUserPresence();
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
};

const broadcastMessage = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const broadcastUserPresence = () => {
  const presenceData = {
    type: 'userPresence',
    users: getCurrentUsers(),
  };
  broadcastMessage(presenceData);
};

const getCurrentUsers = () => {
  // In a real application, you would maintain a list of connected users
  // For this example, we'll return a static list
  return ['User1', 'User2'];
};

module.exports = { server, app };
