
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  if (req.method === 'GET') {
    const documents = await db.all('SELECT * FROM documents');
    res.status(200).json(documents);
  } else if (req.method === 'POST') {
    const { title } = req.body;
    const result = await db.run('INSERT INTO documents (title, createdAt, updatedAt) VALUES (?, ?, ?)', [
      title,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    const document = await db.get('SELECT * FROM documents WHERE id = ?', [result.lastID]);
    res.status(201).json(document);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
