
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./db/collaborative_text_editor.db');

export default function handler(req, res) {
  if (req.method === 'GET') {
    db.all('SELECT * FROM documents', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ documents: rows });
    });
  } else if (req.method === 'POST') {
    const { title } = req.body;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    db.run(
      'INSERT INTO documents (title, createdAt, updatedAt) VALUES (?, ?, ?)',
      [title, createdAt, updatedAt],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, title, createdAt, updatedAt });
      }
    );
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
