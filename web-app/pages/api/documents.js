
import fs from 'fs/promises';
import path from 'path';

const DOCUMENTS_DIR = path.join(process.cwd(), 'documents');

export default async function handler(req, res) {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });

  if (req.method === 'GET') {
    try {
      const files = await fs.readdir(DOCUMENTS_DIR);
      const documents = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(path.join(DOCUMENTS_DIR, file), 'utf-8');
          const { title } = JSON.parse(content);
          return { id: path.parse(file).name, title };
        })
      );
      res.status(200).json(documents);
    } catch (error) {
      console.error('Error reading documents:', error);
      res.status(500).json({ error: 'Error reading documents' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title } = req.body;
      const id = Date.now().toString();
      const documentPath = path.join(DOCUMENTS_DIR, `${id}.json`);
      await fs.writeFile(documentPath, JSON.stringify({ title, content: '' }));
      res.status(201).json({ id, title });
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({ error: 'Error creating document' });
    }
  } else {
    res.status(405).end();
  }
}
