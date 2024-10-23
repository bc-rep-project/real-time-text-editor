
import { v4 as uuidv4 } from 'uuid';

// This is a mock database. In a real application, you'd use a proper database.
let documents = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(documents);
  } else if (req.method === 'POST') {
    const newDocument = {
      id: uuidv4(),
      title: req.body.title || 'Untitled Document',
      content: '',
    };
    documents.push(newDocument);
    res.status(201).json(newDocument);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
