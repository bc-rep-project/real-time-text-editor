
import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  if (req.method === 'POST') {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword
    ]);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, user });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
