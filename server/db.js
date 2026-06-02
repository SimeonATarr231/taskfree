// server/db.js

// Import better-sqlite3
const Database = require('better-sqlite3');

// Import path - a built-in Node.js module for handling file paths
// We don't need to install this, Node.js includes it
const path = require('path');

// Create (or connect to) the database file
// path.join makes sure the file path works on Windows, Mac, and Linux
// __dirname means "the folder this file is in" (server/)
// '../taskflow.db' means go up one level and create the file there
const db = new Database(path.join(__dirname, '../taskflow.db'));

// Enable WAL mode - this makes SQLite faster for web apps
// WAL = Write-Ahead Logging, allows reads and writes at the same time
db.pragma('journal_mode = WAL');

// Create tables if they don't already exist
// This runs every time the server starts - IF NOT EXISTS means
// it won't destroy your data if the table already exists
const initDb = () => {

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
};

// Run the initialization
initDb();

// Export the database connection so other files can use it
module.exports = db;