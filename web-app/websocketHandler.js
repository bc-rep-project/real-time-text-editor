



const WebSocket = require('ws');
const db = require('./database');
const { wsErrorHandler } = require('./errorHandler');
const logger = require('./logger');
const { getCache, setCache, deleteCache } = require('./cacheManager');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    logger.info('A new client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data);
      } catch (error) {
        wsErrorHandler(ws, error);
      }
    });

    ws.on('close', () => {
      logger.info('Client disconnected');
    });
  });

  return wss;
};

const handleWebSocketMessage = async (ws, data) => {
  switch (data.type) {
    case 'documentUpdate':
      try {
        await updateDocument(data);
        await createVersion(data);
        await broadcastMessage(ws, data);
      } catch (error) {
        wsErrorHandler(ws, error);
      }
      break;
    case 'getDocument':
      try {
        const document = await getDocument(data.documentId);
        ws.send(JSON.stringify({ type: 'documentContent', content: document }));
      } catch (error) {
        wsErrorHandler(ws, error);
      }
      break;
    default:
      wsErrorHandler(ws, new Error('Unknown message type'));
  }
};

const getDocument = async (documentId) => {
  const cacheKey = `document:${documentId}`;
  let document = await getCache(cacheKey);

  if (!document) {
    document = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
        if (err) {
          logger.error(`Error fetching document: ${err.message}`);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (document) {
      await setCache(cacheKey, document);
    }
  }

  return document;
};

const updateDocument = async (data) => {
  const cacheKey = `document:${data.documentId}`;
  await deleteCache(cacheKey);

  return new Promise((resolve, reject) => {
    db.run('UPDATE documents SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [data.content, data.documentId], (err) => {
      if (err) {
        logger.error(`Error updating document: ${err.message}`);
        reject(err);
      } else {
        logger.info(`Document ${data.documentId} updated successfully`);
        resolve();
      }
    });
  });
};

const createVersion = (data) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO versions (documentId, content, userId) VALUES (?, ?, ?)', [data.documentId, data.content, data.userId], (err) => {
      if (err) {
        logger.error(`Error creating version: ${err.message}`);
        reject(err);
      } else {
        logger.info(`New version created for document ${data.documentId}`);
        resolve();
      }
    });
  });
};

const broadcastMessage = (ws, data) => {
  ws.server.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
  logger.info(`Broadcasted message to ${ws.server.clients.size - 1} clients`);
};

module.exports = setupWebSocket;



