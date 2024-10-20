import fs from 'fs/promises';
import path from 'path';

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const files = await fs.readdir(DOCUMENTS_DIR);
      const documents = files
        .filter(file => file.endsWith('.txt'))
        .map(file => ({ id: path.parse(file).name }));
      res.status(200).json(documents);
    } catch (error) {
      console.error('Error reading documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
