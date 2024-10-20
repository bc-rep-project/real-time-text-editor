
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

// Other routes remain the same...

module.exports = router;
