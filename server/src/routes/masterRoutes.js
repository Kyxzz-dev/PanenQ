import { Router } from 'express';
import db from '../config/database.js';
import { validateGeoJSON } from '../utils/geojsonValidation.js';

const router = Router();

function parsePositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function locationMeta(row) {
  if (!row) return row;
  const { geojson, ...rest } = row;
  return { ...rest, hasGeojson: Boolean(geojson && geojson.trim()) };
}

router.get('/locations', (_req, res) => {
  const rows = db.prepare(`
    SELECT l.id, l.name, l.description, l.created_at, l.geojson, COUNT(hr.id) AS record_count
    FROM locations l LEFT JOIN harvest_records hr ON hr.location_id = l.id
    GROUP BY l.id ORDER BY l.name
  `).all();
  res.json(rows.map((row) => {
    const { geojson, ...rest } = row;
    return { ...rest, hasGeojson: Boolean(geojson) };
  }));
});

router.get('/locations/:id', (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID lokasi tidak valid.' });
  const row = db.prepare(`
    SELECT l.*, COUNT(hr.id) AS record_count
    FROM locations l LEFT JOIN harvest_records hr ON hr.location_id = l.id
    WHERE l.id = ? GROUP BY l.id
  `).get(id);
  if (!row) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
  res.json(locationMeta(row));
});

router.post('/locations', (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const description = String(req.body.description ?? '').trim();
  if (!name) return res.status(400).json({ message: 'Nama lokasi wajib diisi.' });

  let geojsonValue = null;
  if (req.body.geojson !== undefined && req.body.geojson !== null) {
    const check = validateGeoJSON(req.body.geojson);
    if (!check.valid) return res.status(400).json({ message: check.message });
    geojsonValue = JSON.stringify(check.normalized);
  }

  try {
    const result = db.prepare('INSERT INTO locations (name, description, geojson) VALUES (?, ?, ?)')
      .run(name, description || null, geojsonValue);
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(locationMeta(row));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Nama lokasi sudah digunakan.' });
    throw error;
  }
});

router.put('/locations/:id', (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID lokasi tidak valid.' });
  const name = String(req.body.name ?? '').trim();
  const description = String(req.body.description ?? '').trim();
  if (!name) return res.status(400).json({ message: 'Nama lokasi wajib diisi.' });
  try {
    const result = db.prepare('UPDATE locations SET name = ?, description = ? WHERE id = ?')
      .run(name, description || null, id);
    if (!result.changes) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    res.json(locationMeta(row));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Nama lokasi sudah digunakan.' });
    throw error;
  }
});

router.get('/locations/:id/geojson', (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID lokasi tidak valid.' });
  const row = db.prepare('SELECT geojson FROM locations WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
  if (!row.geojson) {
    return res.status(404).json({ code: 'GEOJSON_NOT_FOUND', message: 'Lokasi belum memiliki batas GeoJSON.' });
  }
  res.json({ id, geojson: JSON.parse(row.geojson) });
});

router.put('/locations/:id/geojson', (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID lokasi tidak valid.' });
  const existing = db.prepare('SELECT id, geojson FROM locations WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });

  const check = validateGeoJSON(req.body.geojson);
  if (!check.valid) {
    // GeoJSON lama tetap dipertahankan saat validasi gagal.
    return res.status(400).json({ message: check.message });
  }

  db.prepare('UPDATE locations SET geojson = ? WHERE id = ?').run(JSON.stringify(check.normalized), id);
  res.json({ id, geojson: check.normalized, message: 'Batas GeoJSON berhasil disimpan.' });
});

router.delete('/locations/:id/geojson', (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'ID lokasi tidak valid.' });
  const result = db.prepare('UPDATE locations SET geojson = NULL WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
  res.json({ message: 'Batas GeoJSON berhasil dihapus.' });
});


router.delete('/locations/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
    if (!result.changes) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
    res.json({ message: 'Lokasi berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || error.code === 'SQLITE_CONSTRAINT_TRIGGER') {
      return res.status(409).json({ message: 'Lokasi masih digunakan pada catatan panen atau perawatan.' });
    }
    throw error;
  }
});

router.get('/harvesters', (_req, res) => {
  res.json(db.prepare(`
    SELECT h.*, COUNT(hr.id) AS record_count
    FROM harvesters h LEFT JOIN harvest_records hr ON hr.harvester_id = h.id
    GROUP BY h.id ORDER BY h.name
  `).all());
});

router.post('/harvesters', (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const employeeCode = String(req.body.employee_code ?? '').trim();
  const isActive = req.body.is_active === false || req.body.is_active === 0 ? 0 : 1;
  if (!name) return res.status(400).json({ message: 'Nama pemanen wajib diisi.' });
  try {
    const result = db.prepare('INSERT INTO harvesters (name, employee_code, is_active) VALUES (?, ?, ?)')
      .run(name, employeeCode || null, isActive);
    res.status(201).json(db.prepare('SELECT * FROM harvesters WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Kode pekerja sudah digunakan.' });
    throw error;
  }
});

router.put('/harvesters/:id', (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const employeeCode = String(req.body.employee_code ?? '').trim();
  const isActive = req.body.is_active === false || req.body.is_active === 0 ? 0 : 1;
  if (!name) return res.status(400).json({ message: 'Nama pemanen wajib diisi.' });
  try {
    const result = db.prepare('UPDATE harvesters SET name = ?, employee_code = ?, is_active = ? WHERE id = ?')
      .run(name, employeeCode || null, isActive, req.params.id);
    if (!result.changes) return res.status(404).json({ message: 'Pemanen tidak ditemukan.' });
    res.json(db.prepare('SELECT * FROM harvesters WHERE id = ?').get(req.params.id));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Kode pekerja sudah digunakan.' });
    throw error;
  }
});

router.delete('/harvesters/:id', (req, res) => {
  const result = db.prepare('DELETE FROM harvesters WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ message: 'Pemanen tidak ditemukan.' });
  res.json({ message: 'Pemanen berhasil dihapus.' });
});

export default router;
