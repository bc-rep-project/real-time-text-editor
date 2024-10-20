




const WebSocket = require('ws');
const db = require('./database');
const { wsErrorHandler } = require('./errorHandler');
const logger = require('./logger');
const { getCache, setCache, deleteCache } = require('./cacheManager');
const ot = require('ot-text');

const documents = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    logger.info('A new client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await handleWebSocketMessage(ws, data);
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
    case 'joinDocument':
      try {
        const document = await getDocument(data.documentId);
        if (!documents.has(data.documentId)) {
          documents.set(data.documentId, { content: document.content, version: document.version, clients: new Set() });
        }
        documents.get(data.documentId).clients.add(ws);
        ws.send(JSON.stringify({ type: 'documentContent', content: document.content, version: document.version }));
      } catch (error) {
        wsErrorHandler(ws, error);
      }
      break;
    case 'documentUpdate':
      try {
        const doc = documents.get(data.documentId);
        if (!doc) {
          throw new Error('Document not found');
        }
        const operation = ot.TextOperation.fromJSON(data.operation);
        if (data.version !== doc.version) {
          // Handle version mismatch
          ws.send(JSON.stringify({
            type: 'versionMismatch',
            documentId: data.documentId,
            serverVersion: doc.version
          }));
          return;
        }
        doc.content = operation.apply(doc.content);
        doc.version++;
        await updateDocument({
          documentId: data.documentId,
          content: doc.content,
          version: doc.version
        });
        await createVersion({
          documentId: data.documentId,
          content: doc.content,
          userId: data.userId,
          version: doc.version
        });
        await broadcastMessage(ws, {
          type: 'documentUpdate',
          documentId: data.documentId,
          operation: data.operation,
          version: doc.version
        });
      } catch (error) {
        if (error.message === 'Version conflict') {
          ws.send(JSON.stringify({
            type: 'versionMismatch',
            documentId: data.documentId,
            serverVersion: documents.get(data.documentId).version
          }));
        } else {
          wsErrorHandler(ws, error);
        }
      }
      break;
    case 'getDocument':
      try {
        const document = await getDocument(data.documentId);
        ws.send(JSON.stringify({ type: 'documentContent', content: document.content, version: document.version }));
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
    db.run('UPDATE documents SET content = ?, version = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND version = ?', 
    [data.content, data.version, data.documentId, data.version - 1], 
    function(err) {
      if (err) {
        logger.error(`Error updating document: ${err.message}`);
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Version conflict'));
      } else {
        logger.info(`Document ${data.documentId} updated successfully to version ${data.version}`);
        resolve();
      }
    });
  });
};

const createVersion = (data) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO versions (documentId, content, userId, version) VALUES (?, ?, ?, ?)', 
    [data.documentId, data.content, data.userId, data.version], 
    (err) => {
      if (err) {
        logger.error(`Error creating version: ${err.message}`);
        reject(err);
      } else {
        logger.info(`Version ${data.version} created for document ${data.documentId}`);
        resolve();
      }
    });
  });
};

const broadcastMessage = async (sender, data) => {
  const doc = documents.get(data.documentId);
  if (!doc) {
    throw new Error('Document not found');
  }

  const message = JSON.stringify({
    type: 'documentUpdate',
    documentId: data.documentId,
    operation: data.operation,
    version: data.version
  });

  for (const client of doc.clients) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
  logger.info(`Broadcasted message to ${doc.clients.size - 1} clients for document ${data.documentId}`);
};

module.exports = setupWebSocket;
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
    db.run('UPDATE documents SET content = ?, version = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [data.content, data.version, data.documentId], (err) => {
      if (err) {
        logger.error(`Error updating document: ${err.message}`);
        reject(err);
      } else {
        logger.info(`Document ${data.documentId} updated successfully to version ${data.version}`);
        resolve();
      }
    });
  });
};

const createVersion = (data) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO versions (documentId, content, userId, version) VALUES (?, ?, ?, ?)', [data.documentId, data.content, data.userId, data.version], (err) => {
      if (err) {
        logger.error(`Error creating version: ${err.message}`);
        reject(err);
      } else {
        logger.info(`Version ${data.version} created for document ${data.documentId}`);
        resolve();
      }
    });
  });
};

const broadcastMessage = async (sender, data) => {
  const doc = documents.get(data.documentId);
  if (!doc) {
    throw new Error('Document not found');
  }

  const message = JSON.stringify({
    type: 'documentUpdate',
    documentId: data.documentId,
    operation: data.operation,
    version: data.version
  });

  for (const client of doc.clients) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
  logger.info(`Broadcasted message to ${doc.clients.size - 1} clients for document ${data.documentId}`);
};

module.exports = setupWebSocket;




