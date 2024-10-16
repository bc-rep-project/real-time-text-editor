
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create documents table
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`);

  // Create versions table
  db.run(`CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documentId INTEGER NOT NULL,
    content TEXT,
    createdAt TEXT NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (documentId) REFERENCES documents(id)
  )`);

  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`);

  // Create chat_messages table
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documentId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (documentId) REFERENCES documents(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
});

db.close();
console.log('Database initialized and tables created.');
