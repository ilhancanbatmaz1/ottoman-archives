const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize Schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turkish TEXT NOT NULL,
    ottoman TEXT NOT NULL,
    category TEXT DEFAULT 'GENERAL'
  )`, (err) => {
    if (err) {
      console.error('Error creating table: ' + err.message);
    } else {
      // Create unique index to prevent duplicates
      db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_turkish ON dictionary(turkish)`, (err) => {
        if (err) {
          console.error('Error creating index: ' + err.message);
        }
      });
    }
  });
});

module.exports = db;
