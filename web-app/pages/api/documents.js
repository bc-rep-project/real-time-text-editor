import db from '../../database';

export default function handler(req, res) {
  if (req.method === 'GET') {
    db.all('SELECT * FROM documents', (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Error fetching documents' });
      } else {
        res.status(200).json(rows);
      }
    });
  } else if (req.method === 'POST') {
    const { title, content } = req.body;
    db.run('INSERT INTO documents (title, content) VALUES (?, ?)', [title, content], function(err) {
      if (err) {
        res.status(500).json({ error: 'Error creating document' });
      } else {
        res.status(201).json({ id: this.lastID, title, content });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
