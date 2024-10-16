
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  const { documentId } = req.query;

  if (req.method === 'GET') {
    const document = await db.get('SELECT * FROM documents WHERE id = ?', [documentId]);
    res.status(200).json(document);
  } else if (req.method === 'PUT') {
    const { content } = req.body;
    await db.run('UPDATE documents SET content = ?, updatedAt = ? WHERE id = ?', [
      content,
      new Date().toISOString(),
      documentId
    ]);
    const document = await db.get('SELECT * FROM documents WHERE id = ?', [documentId]);
    res.status(200).json(document);
  } else if (req.method === 'DELETE') {
    await db.run('DELETE FROM documents WHERE id = ?', [documentId]);
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
