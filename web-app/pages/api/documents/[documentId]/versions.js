
const db = require('../../../../../database');

export default function handler(req, res) {
  const { documentId } = req.query;

  if (req.method === 'GET') {
    db.all('SELECT * FROM versions WHERE documentId = ?', [documentId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ versions: rows });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
