const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')
const fs = require('fs')

// Store DB in ~/.spktr/
const SPKTR_DIR = path.join(os.homedir(), '.spktr')
if (!fs.existsSync(SPKTR_DIR)) fs.mkdirSync(SPKTR_DIR, { recursive: true })

const DB_PATH = path.join(SPKTR_DIR, 'data.db')
const db = new Database(DB_PATH)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    summary TEXT
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    user_query TEXT,
    ai_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS screenshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_id INTEGER,
    phash TEXT,
    diff_percent REAL,
    window_title TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interaction_id) REFERENCES interactions(id)
  );
`)

console.log(`[db] SQLite initialized at ${DB_PATH}`)

module.exports = db
