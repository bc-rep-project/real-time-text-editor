
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
    const messages = await db.all('SELECT * FROM chat_messages WHERE documentId = ?', [documentId]);
    res.status(200).json(messages);
  } else if (req.method === 'POST') {
    const { userId, message } = req.body;
    console.log("Received request body:", req.body);
    console.log("Received request body:", req.body);
    console.log("Received request body:", req.body);
    console.log("Received request body:", req.body);
    console.log("Received request body:", req.body);
    console.log("Received request body:", req.body);
    console.log("Received request body:", req.body);
    console.log("Received userId:", userId);
    const result = await db.run('INSERT INTO chat_messages (documentId, userId, message, timestamp) VALUES (?, ?, ?, ?)', [
      documentId,
      userId,
      message,
      new Date().toISOString()
    ]);
    const chatMessage = await db.get('SELECT * FROM chat_messages WHERE id = ?', [result.lastID]);
    res.status(201).json(chatMessage);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
