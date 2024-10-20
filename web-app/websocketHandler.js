const WebSocket = require('ws');
const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');

const DOCUMENTS_DIR = path.join(__dirname, 'documents');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();
  const documents = new Map();

  // Ensure the documents directory exists
  fs.mkdir(DOCUMENTS_DIR, { recursive: true }).catch(err => {
    logger.error(`Error creating documents directory: ${err.message}`);
  });

  wss.on('connection', (ws) => {
    logger.info('New client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'join') {
          const { username, documentId } = data;
          clients.set(ws, { username, documentId });
          logger.info(`User ${username} joined document ${documentId}`);

          // Load or create document
          if (!documents.has(documentId)) {
            const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.txt`);
            try {
              const content = await fs.readFile(documentPath, 'utf8');
              documents.set(documentId, content);
            } catch (err) {
              logger.info(`Creating new document ${documentId}`);
              documents.set(documentId, '');
            }
          }

          ws.send(JSON.stringify({ 
            type: 'update', 
            content: documents.get(documentId), 
            username: 'Server' 
          }));
        } else if (data.type === 'update') {
          const { content, username, documentId } = data;
          documents.set(documentId, content);

          // Save the updated content to the file
          const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.txt`);
          await fs.writeFile(documentPath, content, 'utf8');

          // Broadcast the update to all clients in the same document
          clients.forEach((clientData, client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN && clientData.documentId === documentId) {
              client.send(JSON.stringify({
                type: 'update',
                content,
                username
              }));
            }
          });
        }
      } catch (error) {
        logger.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      const clientData = clients.get(ws);
      if (clientData) {
        const { username, documentId } = clientData;
        clients.delete(ws);
        logger.info(`User ${username} disconnected from document ${documentId}`);
      }
    });
  });

  return wss;
};

module.exports = setupWebSocket;
