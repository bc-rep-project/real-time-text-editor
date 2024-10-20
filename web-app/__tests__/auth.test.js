


const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { authenticateUser, registerUser, loginUser } = require('../auth');
const db = require('../database');
const logger = require('../logger');

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../database');
jest.mock('../logger');

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    // ... (existing tests remain the same)
  });

  describe('registerUser', () => {
    it('should register a new user and return a token', async () => {
      const req = { body: { username: 'newuser', password: 'password123' } };
      const res = {
        json: jest.fn(),
      };

      bcrypt.hash.mockResolvedValue('hashedpassword');
      db.run.mockImplementation((query, params, callback) => {
        callback(null, { lastID: 1 });
      });
      jwt.sign.mockReturnValue('newtoken');

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10, expect.any(Function));
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['newuser', 'hashedpassword'],
        expect.any(Function)
      );
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1, username: 'newuser' }, expect.any(String), { expiresIn: '1h' });
      expect(res.json).toHaveBeenCalledWith({ token: 'newtoken' });
    });
  });

  describe('loginUser', () => {
    it('should login a user and return a token if credentials are valid', async () => {
      const req = { body: { username: 'existinguser', password: 'password123' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      db.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1, username: 'existinguser', password: 'hashedpassword' });
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('newtoken');

      await loginUser(req, res);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['existinguser'],
        expect.any(Function)
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword', expect.any(Function));
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1, username: 'existinguser' }, expect.any(String), { expiresIn: '1h' });
      expect(res.json).toHaveBeenCalledWith({ token: 'newtoken' });
    });

    it('should return 401 if credentials are invalid', async () => {
      // ... (existing test remains the same)
    });
  });
});


