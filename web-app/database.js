
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create documents table
  db.run('CREATE TABLE IF NOT EXISTS documents (' +
      'id INTEGER PRIMARY KEY,' +
      'title TEXT,' +
      'content TEXT,' +
      'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
      'updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ')');

  // Create versions table
  db.run('CREATE TABLE IF NOT EXISTS versions (' +
      'id INTEGER PRIMARY KEY,' +
      'documentId INTEGER,' +
      'content TEXT,' +
      'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
      'userId INTEGER,' +
      'FOREIGN KEY(documentId) REFERENCES documents(id),' +
      'FOREIGN KEY(userId) REFERENCES users(id)' +
    ')');

  // Create users table
  db.run('CREATE TABLE IF NOT EXISTS users (' +
      'id INTEGER PRIMARY KEY,' +
      'username TEXT UNIQUE,' +
      'password TEXT' +
    ')');

  // Create chat_messages table
  db.run('CREATE TABLE IF NOT EXISTS chat_messages (' +
      'id INTEGER PRIMARY KEY,' +
      'documentId INTEGER,' +
      'userId INTEGER,' +
      'message TEXT,' +
      'timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
      'FOREIGN KEY(documentId) REFERENCES documents(id),' +
      'FOREIGN KEY(userId) REFERENCES users(id)' +
    ')');
});

module.exports = db;
