
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./database');
const logger = require('./logger');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};

const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

const registerUser = (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      logger.error(`Error hashing password: ${err.message}`);
      return res.status(500).json({ error: 'Error registering user' });
    }

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) {
        logger.error(`Error registering user: ${err.message}`);
        return res.status(500).json({ error: 'Error registering user' });
      }

      const user = { id: this.lastID, username };
      const token = generateToken(user);
      res.json({ token });
    });
  });
};

const loginUser = (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      logger.error(`Error logging in user: ${err.message}`);
      return res.status(500).json({ error: 'Error logging in' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        logger.error(`Error comparing passwords: ${err.message}`);
        return res.status(500).json({ error: 'Error logging in' });
      }

      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      res.json({ token });
    });
  });
};

module.exports = {
  authenticateUser,
  registerUser,
  loginUser
};
