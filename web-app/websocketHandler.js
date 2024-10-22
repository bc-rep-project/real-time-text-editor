

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
        logger.info(`Received message: ${JSON.stringify(data)}`);
        if (data.type === 'join') {
          const { username, documentId } = data;
          clients.set(ws, { username, documentId });
          logger.info(`User ${username} joined document ${documentId}`);

          // Load or create document
          if (!documents.has(documentId)) {
            const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
            try {
              const fileContent = await fs.readFile(documentPath, 'utf8');
              const { title, content } = JSON.parse(fileContent);
              documents.set(documentId, { title, content });
            } catch (err) {
              logger.info(`Creating new document ${documentId}`);
              documents.set(documentId, { title: `Document ${documentId}`, content: '' });
            }
          }

          const { title, content } = documents.get(documentId);
          ws.send(JSON.stringify({ 
            type: 'update', 
            title,
            content, 
            username: 'Server' 
          }));
        } else if (data.type === 'update') {
          const { content, title, username, documentId } = data;
          documents.set(documentId, { title, content });

          // Save the updated content to the file
          const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
          await fs.writeFile(documentPath, JSON.stringify({ title, content }), 'utf8');

          // Broadcast the update to all clients in the same document
          clients.forEach((clientData, client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN && clientData.documentId === documentId) {
              client.send(JSON.stringify({
                type: 'update',
                title,
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


