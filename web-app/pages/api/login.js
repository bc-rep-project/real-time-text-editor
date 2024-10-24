
import { sign } from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Here you would typically check the username and password against your database
    // For this example, we'll just check if the username and password are not empty
    if (username && password) {
      // Create a JWT token
      const token = sign(
        { username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
