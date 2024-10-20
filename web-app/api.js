
const express = require('express');
const router = express.Router();
const db = require('./database');

// GET /api/documents
router.get('/documents', (req, res) => {
  db.all('SELECT id, title, updatedAt FROM documents', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/documents
router.post('/documents', (req, res) => {
  const { title, content } = req.body;
  db.run('INSERT INTO documents (title, content) VALUES (?, ?)', [title, content], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// GET /api/documents/:documentId
router.get('/documents/:documentId', (req, res) => {
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.documentId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json(row);
  });
});

// PUT /api/documents/:documentId
router.put('/documents/:documentId', (req, res) => {
  const { title, content } = req.body;
  db.run(
    'UPDATE documents SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, req.params.documentId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }
      res.json({ message: 'Document updated successfully' });
    }
  );
});

// DELETE /api/documents/:documentId
router.delete('/documents/:documentId', (req, res) => {
  db.run('DELETE FROM documents WHERE id = ?', [req.params.documentId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json({ message: 'Document deleted successfully' });
  });
});

// GET /api/documents/:documentId/versions
router.get('/documents/:documentId/versions', (req, res) => {
  db.all('SELECT * FROM versions WHERE documentId = ? ORDER BY createdAt DESC', [req.params.documentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET /api/chat/:documentId
router.get('/chat/:documentId', (req, res) => {
  db.all('SELECT * FROM chat_messages WHERE documentId = ? ORDER BY timestamp ASC', [req.params.documentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST /api/chat/:documentId
router.post('/chat/:documentId', (req, res) => {
  const { userId, message } = req.body;
  db.run(
    'INSERT INTO chat_messages (documentId, userId, message) VALUES (?, ?, ?)',
    [req.params.documentId, userId, message],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id, username FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json({ id: row.id, username: row.username });
  });
});

module.exports = router;
