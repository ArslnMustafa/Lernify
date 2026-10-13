const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "lernify.db");

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'single',
    text TEXT NOT NULL,
    image_url TEXT,
    options TEXT,
    correct_index INTEGER,
    answer_text TEXT,
    source_key TEXT
  );

  CREATE TABLE IF NOT EXISTS exam_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(exam_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS trainer_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    box INTEGER NOT NULL DEFAULT 1,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    due_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, item_key)
  );

  CREATE TABLE IF NOT EXISTS simulation_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    total INTEGER NOT NULL,
    correct INTEGER,
    seconds INTEGER,
    questions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    answers TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Added after the table shipped, so existing installs need it filled in.
const trainerColumns = db.prepare("PRAGMA table_info(trainer_progress)").all();
if (!trainerColumns.some((column) => column.name === "kind")) {
  db.exec("ALTER TABLE trainer_progress ADD COLUMN kind TEXT");
}

// When a card is due again. Added later, so cards learned before this are due
// right away, which is the safe direction.
if (!trainerColumns.some((column) => column.name === "due_at")) {
  db.exec("ALTER TABLE trainer_progress ADD COLUMN due_at TEXT");
}

// Says which building, card, epoch or theory question a question came from, so
// scripts/apply-images.js can give it a picture without rebuilding the exams.
const questionColumns = db.prepare("PRAGMA table_info(questions)").all();
if (!questionColumns.some((column) => column.name === "source_key")) {
  db.exec("ALTER TABLE questions ADD COLUMN source_key TEXT");
}

module.exports = db;
