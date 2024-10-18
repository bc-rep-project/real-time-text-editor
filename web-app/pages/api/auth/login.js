
const db = require('../../../../database');
const bcrypt = require('bcrypt');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!result) {
          res.status(401).json({ error: 'Invalid username or password' });
          return;
        }
        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username } });
      });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
