
const db = require('../../../../database');

export default function handler(req, res) {
  const { documentId } = req.query;

  if (req.method === 'GET') {
    db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }
      res.status(200).json({ document: row });
    });
  } else if (req.method === 'PUT') {
    const { title, content } = req.body;
    db.run('UPDATE documents SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [title, content, documentId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }
      res.status(200).json({ message: 'Document updated successfully' });
    });
  } else if (req.method === 'DELETE') {
    db.run('DELETE FROM documents WHERE id = ?', [documentId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }
      res.status(200).json({ message: 'Document deleted successfully' });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
