import { Router } from 'express';
import db from '../config/database.js';
import { optionalNonNegativeNumber, positiveInteger, validDate } from '../utils/validation.js';

const router = Router();
const selectSql = `
  SELECT hr.*, l.name AS location_name, h.name AS harvester_name
  FROM harvest_records hr
  JOIN locations l ON l.id = hr.location_id
  LEFT JOIN harvesters h ON h.id = hr.harvester_id
`;

router.get('/', (req, res) => {
  const { startDate, endDate, locationId, harvesterId } = req.query;
  const where = [];
  const params = [];
  if (startDate) { where.push('hr.harvest_date >= ?'); params.push(startDate); }
  if (endDate) { where.push('hr.harvest_date <= ?'); params.push(endDate); }
  if (locationId) { where.push('hr.location_id = ?'); params.push(locationId); }
  if (harvesterId) { where.push('hr.harvester_id = ?'); params.push(harvesterId); }
  const sql = `${selectSql} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY hr.harvest_date DESC, hr.id DESC`;
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`${selectSql} WHERE hr.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Catatan panen tidak ditemukan.' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes } = req.body;
  if (!validDate(harvest_date)) return res.status(400).json({ message: 'Tanggal panen tidak valid.' });
  if (!positiveInteger(location_id)) return res.status(400).json({ message: 'Lokasi wajib dipilih.' });
  if (!positiveInteger(bunch_count)) return res.status(400).json({ message: 'Jumlah tandan harus bilangan bulat lebih dari nol.' });
  if (!optionalNonNegativeNumber(total_weight_kg)) return res.status(400).json({ message: 'Berat harus bernilai nol atau lebih.' });
  if (harvester_id && !positiveInteger(harvester_id)) return res.status(400).json({ message: 'Pemanen tidak valid.' });

  const result = db.prepare(`
    INSERT INTO harvest_records (harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(harvest_date, Number(location_id), harvester_id ? Number(harvester_id) : null,
    Number(bunch_count), total_weight_kg === '' || total_weight_kg == null ? null : Number(total_weight_kg),
    String(notes ?? '').trim() || null);
  res.status(201).json(db.prepare(`${selectSql} WHERE hr.id = ?`).get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { harvest_date, location_id, harvester_id, bunch_count, total_weight_kg, notes } = req.body;
  if (!validDate(harvest_date)) return res.status(400).json({ message: 'Tanggal panen tidak valid.' });
  if (!positiveInteger(location_id)) return res.status(400).json({ message: 'Lokasi wajib dipilih.' });
  if (!positiveInteger(bunch_count)) return res.status(400).json({ message: 'Jumlah tandan harus bilangan bulat lebih dari nol.' });
  if (!optionalNonNegativeNumber(total_weight_kg)) return res.status(400).json({ message: 'Berat harus bernilai nol atau lebih.' });
  if (harvester_id && !positiveInteger(harvester_id)) return res.status(400).json({ message: 'Pemanen tidak valid.' });

  const result = db.prepare(`
    UPDATE harvest_records
    SET harvest_date = ?, location_id = ?, harvester_id = ?, bunch_count = ?,
        total_weight_kg = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(harvest_date, Number(location_id), harvester_id ? Number(harvester_id) : null,
    Number(bunch_count), total_weight_kg === '' || total_weight_kg == null ? null : Number(total_weight_kg),
    String(notes ?? '').trim() || null, req.params.id);
  if (!result.changes) return res.status(404).json({ message: 'Catatan panen tidak ditemukan.' });
  res.json(db.prepare(`${selectSql} WHERE hr.id = ?`).get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM harvest_records WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ message: 'Catatan panen tidak ditemukan.' });
  res.json({ message: 'Catatan panen berhasil dihapus.' });
});

export default router;
