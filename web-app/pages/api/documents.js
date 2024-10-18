
const db = require('../../../database');

export default function handler(req, res) {
  if (req.method === 'GET') {
    db.all('SELECT * FROM documents', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ documents: rows });
    });
  } else if (req.method === 'POST') {
    const { title, content } = req.body;
    db.run('INSERT INTO documents (title, content) VALUES (?, ?)', [title, content], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ document: { id: this.lastID, title, content } });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
