
const db = require('../../../../database');

export default function handler(req, res) {
  const { documentId } = req.query;

  if (req.method === 'GET') {
    db.all('SELECT * FROM chat_messages WHERE documentId = ?', [documentId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ messages: rows });
    });
  } else if (req.method === 'POST') {
    const { userId, message } = req.body;
    db.run('INSERT INTO chat_messages (documentId, userId, message) VALUES (?, ?, ?)', [documentId, userId, message], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ message: { id: this.lastID, documentId, userId, message } });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
