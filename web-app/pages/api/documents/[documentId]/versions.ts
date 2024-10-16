
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
    const versions = await db.all('SELECT * FROM versions WHERE documentId = ?', [documentId]);
    res.status(200).json(versions);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
