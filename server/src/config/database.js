import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.resolve(__dirname, '../../database');
fs.mkdirSync(databaseDir, { recursive: true });

const db = new Database(path.join(databaseDir, 'panen.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS harvesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    employee_code TEXT UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS harvest_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    harvest_date TEXT NOT NULL,
    location_id INTEGER NOT NULL,
    harvester_id INTEGER,
    bunch_count INTEGER NOT NULL CHECK (bunch_count > 0),
    total_weight_kg REAL CHECK (total_weight_kg IS NULL OR total_weight_kg >= 0),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (harvester_id) REFERENCES harvesters(id) ON UPDATE CASCADE ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_harvest_date ON harvest_records(harvest_date);
  CREATE INDEX IF NOT EXISTS idx_harvest_location ON harvest_records(location_id);
  CREATE INDEX IF NOT EXISTS idx_harvest_harvester ON harvest_records(harvester_id);
`);

export default db;
