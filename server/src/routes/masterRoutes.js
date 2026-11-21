import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

router.get('/locations', (_req, res) => {
  const rows = db.prepare(`
    SELECT l.*, COUNT(hr.id) AS record_count
    FROM locations l LEFT JOIN harvest_records hr ON hr.location_id = l.id
    GROUP BY l.id ORDER BY l.name
  `).all();
  res.json(rows);
});

router.post('/locations', (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const description = String(req.body.description ?? '').trim();
  if (!name) return res.status(400).json({ message: 'Nama lokasi wajib diisi.' });
  try {
    const result = db.prepare('INSERT INTO locations (name, description) VALUES (?, ?)').run(name, description || null);
    res.status(201).json(db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Nama lokasi sudah digunakan.' });
    throw error;
  }
});

router.put('/locations/:id', (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const description = String(req.body.description ?? '').trim();
  if (!name) return res.status(400).json({ message: 'Nama lokasi wajib diisi.' });
  try {
    const result = db.prepare('UPDATE locations SET name = ?, description = ? WHERE id = ?').run(name, description || null, req.params.id);
    if (!result.changes) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
    res.json(db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Nama lokasi sudah digunakan.' });
    throw error;
  }
});

router.delete('/locations/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
    if (!result.changes) return res.status(404).json({ message: 'Lokasi tidak ditemukan.' });
    res.json({ message: 'Lokasi berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') return res.status(409).json({ message: 'Lokasi masih digunakan pada catatan panen.' });
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
