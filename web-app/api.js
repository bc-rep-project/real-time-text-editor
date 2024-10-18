
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('/home/user/web-app/database.db');

// API Endpoints

// GET /api/documents - Retrieves a list of documents
app.get('/api/documents', (req, res) => {
  db.all('SELECT id, title, updatedAt FROM documents', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ documents: rows });
  });
});

// POST /api/documents - Creates a new document
app.post('/api/documents', (req, res) => {
  const { title, content } = req.body;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  db.run('INSERT INTO documents (title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [title, content, createdAt, updatedAt], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, title, content, createdAt, updatedAt });
  });
});

// GET /api/documents/:documentId - Retrieves a specific document
app.get('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// PUT /api/documents/:documentId - Updates a specific document
app.put('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const { title, content } = req.body;
  const updatedAt = new Date().toISOString();
  db.run('UPDATE documents SET title = ?, content = ?, updatedAt = ? WHERE id = ?', [title, content, updatedAt, documentId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: documentId, title, content, updatedAt });
  });
});

// DELETE /api/documents/:documentId - Deletes a specific document
app.delete('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  db.run('DELETE FROM documents WHERE id = ?', [documentId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Document deleted successfully' });
  });
});

// GET /api/documents/:documentId/versions - Retrieves the version history of a specific document
app.get('/api/documents/:documentId/versions', (req, res) => {
  const { documentId } = req.params;
  db.all('SELECT * FROM versions WHERE documentId = ?', [documentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ versions: rows });
  });
});

// GET /api/chat/:documentId - Retrieves the chat history for a specific document
app.get('/api/chat/:documentId', (req, res) => {
  const { documentId } = req.params;
  db.all('SELECT * FROM chat_messages WHERE documentId = ?', [documentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ messages: rows });
  });
});

// POST /api/chat/:documentId - Sends a new chat message
app.post('/api/chat/:documentId', (req, res) => {
  const { documentId } = req.params;
  const { userId, message } = req.body;
  const timestamp = new Date().toISOString();
  db.run('INSERT INTO chat_messages (documentId, userId, message, timestamp) VALUES (?, ?, ?, ?)', [documentId, userId, message, timestamp], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, documentId, userId, message, timestamp });
  });
});

// POST /api/auth/login - Handles user login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({ message: 'Login successful', user: row });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
