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

  CREATE TABLE IF NOT EXISTS maintenance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    harvester_id INTEGER,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('pemupukan', 'penyemprotan', 'pruning')),
    maintenance_date DATE NOT NULL,
    material_category TEXT,
    material_name TEXT,
    work_type TEXT,
    dosage REAL,
    dosage_unit TEXT,
    quantity REAL,
    quantity_unit TEXT,
    area REAL,
    area_unit TEXT,
    tree_count INTEGER,
    material_cost REAL NOT NULL DEFAULT 0,
    labor_cost REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (harvester_id) REFERENCES harvesters(id) ON UPDATE CASCADE ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_records(maintenance_date);
  CREATE INDEX IF NOT EXISTS idx_maintenance_location ON maintenance_records(location_id);
  CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance_records(maintenance_type);
`);

const maintenanceCols = db.prepare('PRAGMA table_info(maintenance_records)').all().map((col) => col.name);
if (!maintenanceCols.includes('material_category')) {
  db.exec('ALTER TABLE maintenance_records ADD COLUMN material_category TEXT');
}
if (!maintenanceCols.includes('work_type')) {
  db.exec('ALTER TABLE maintenance_records ADD COLUMN work_type TEXT');
}

const locationCols = db.prepare('PRAGMA table_info(locations)').all().map((col) => col.name);
if (!locationCols.includes('geojson')) {
  db.exec('ALTER TABLE locations ADD COLUMN geojson TEXT');
}

export default db;
