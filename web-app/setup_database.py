
import sqlite3

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('/home/user/web-app/database.db')
cursor = conn.cursor()

# Create documents table
cursor.execute('''
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# Create versions table
cursor.execute('''
CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY,
    documentId INTEGER,
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER,
    FOREIGN KEY (documentId) REFERENCES documents(id),
    FOREIGN KEY (userId) REFERENCES users(id)
)
''')

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
)
''')

# Create chat_messages table
cursor.execute('''
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY,
    documentId INTEGER,
    userId INTEGER,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documentId) REFERENCES documents(id),
    FOREIGN KEY (userId) REFERENCES users(id)
)
''')

# Commit changes and close the connection
conn.commit()
conn.close()
