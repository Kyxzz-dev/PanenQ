import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

router.get('/dashboard/summary', (_req, res) => {
  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(bunch_count), 0) AS total_bunches,
      COALESCE(SUM(total_weight_kg), 0) AS total_weight_kg,
      COUNT(*) AS total_records
    FROM harvest_records
    WHERE harvest_date = date('now', 'localtime')
  `).get();
  const allTime = db.prepare(`
    SELECT COALESCE(SUM(bunch_count), 0) AS total_bunches,
      COALESCE(SUM(total_weight_kg), 0) AS total_weight_kg,
      COUNT(*) AS total_records
    FROM harvest_records
  `).get();
  const recent = db.prepare(`
    SELECT hr.id, hr.harvest_date, hr.bunch_count, hr.total_weight_kg,
      l.name AS location_name, h.name AS harvester_name
    FROM harvest_records hr
    JOIN locations l ON l.id = hr.location_id
    LEFT JOIN harvesters h ON h.id = hr.harvester_id
    ORDER BY hr.harvest_date DESC, hr.id DESC LIMIT 6
  `).all();
  res.json({ today: totals, allTime, recent });
});

router.get('/reports/summary', (req, res) => {
  const startDate = req.query.startDate || '2000-01-01';
  const endDate = req.query.endDate || '2999-12-31';
  const byLocation = db.prepare(`
    SELECT l.id, l.name, SUM(hr.bunch_count) AS total_bunches,
      COALESCE(SUM(hr.total_weight_kg), 0) AS total_weight_kg,
      COUNT(hr.id) AS total_records
    FROM harvest_records hr JOIN locations l ON l.id = hr.location_id
    WHERE hr.harvest_date BETWEEN ? AND ?
    GROUP BY l.id ORDER BY total_bunches DESC
  `).all(startDate, endDate);
  const totals = db.prepare(`
    SELECT COALESCE(SUM(bunch_count), 0) AS total_bunches,
      COALESCE(SUM(total_weight_kg), 0) AS total_weight_kg,
      COUNT(*) AS total_records
    FROM harvest_records WHERE harvest_date BETWEEN ? AND ?
  `).get(startDate, endDate);
  res.json({ startDate, endDate, totals, byLocation });
});

export default router;
