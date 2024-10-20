

const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    logger.error(`Error opening database: ${err.message}`);
  } else {
    logger.info('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Create documents table
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      logger.error(`Error creating documents table: ${err.message}`);
    } else {
      logger.info('Documents table created or already exists.');
    }
  });

  // Create versions table
  db.run(`CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY,
    documentId INTEGER,
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER,
    FOREIGN KEY (documentId) REFERENCES documents(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`, (err) => {
    if (err) {
      logger.error(`Error creating versions table: ${err.message}`);
    } else {
      logger.info('Versions table created or already exists.');
    }
  });

  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`, (err) => {
    if (err) {
      logger.error(`Error creating users table: ${err.message}`);
    } else {
      logger.info('Users table created or already exists.');
    }
  });

  // Create chat_messages table
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY,
    documentId INTEGER,
    userId INTEGER,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documentId) REFERENCES documents(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`, (err) => {
    if (err) {
      logger.error(`Error creating chat_messages table: ${err.message}`);
    } else {
      logger.info('Chat_messages table created or already exists.');
    }
  });
});

module.exports = db;

