
const express = require('express');
const router = express.Router();
const db = require('./database');

// Temporary test user
const testUser = { id: 1, username: 'testuser', password: 'testpass' };

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === testUser.username && password === testUser.password) {
    res.json({ id: testUser.id, username: testUser.username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

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
  const { content } = req.body;
  db.run(
    'UPDATE documents SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [content, req.params.documentId],
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

module.exports = router;
