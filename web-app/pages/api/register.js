
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const users = [];
const SECRET_KEY = 'your-secret-key'; // In a real application, this should be stored securely

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({ token });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
