import { Router } from 'express';
import db from '../config/database.js';
import {
  MAINTENANCE_TYPES,
  buildMaintenanceFilterClause,
  formatMaintenanceRow,
  maintenanceSelectSql,
} from './maintenanceRoutes.js';

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

router.get('/reports/maintenance', (req, res) => {
  const { where, params, error } = buildMaintenanceFilterClause(req.query);
  if (error) return res.status(400).json({ message: error });

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalsRow = db.prepare(`
    SELECT
      COUNT(*) AS total_activities,
      COALESCE(SUM(mr.material_cost), 0) AS total_material_cost,
      COALESCE(SUM(mr.labor_cost), 0) AS total_labor_cost
    FROM maintenance_records mr
    JOIN locations l ON l.id = mr.location_id
    ${whereSql}
  `).get(...params);

  const byTypeRows = db.prepare(`
    SELECT
      mr.maintenance_type,
      COUNT(*) AS total_activities,
      COALESCE(SUM(mr.material_cost), 0) AS total_material_cost,
      COALESCE(SUM(mr.labor_cost), 0) AS total_labor_cost
    FROM maintenance_records mr
    JOIN locations l ON l.id = mr.location_id
    ${whereSql}
    GROUP BY mr.maintenance_type
  `).all(...params);

  const byTypeMap = new Map(byTypeRows.map((row) => [row.maintenance_type, row]));
  const byType = MAINTENANCE_TYPES.map((type) => {
    const row = byTypeMap.get(type);
    const materialCost = Number(row?.total_material_cost || 0);
    const laborCost = Number(row?.total_labor_cost || 0);
    return {
      maintenanceType: type,
      totalActivities: Number(row?.total_activities || 0),
      totalMaterialCost: materialCost,
      totalLaborCost: laborCost,
      totalCost: materialCost + laborCost,
    };
  });

  const byLocation = db.prepare(`
    SELECT
      l.id,
      l.name,
      COUNT(mr.id) AS total_activities,
      COALESCE(SUM(mr.material_cost), 0) AS total_material_cost,
      COALESCE(SUM(mr.labor_cost), 0) AS total_labor_cost
    FROM maintenance_records mr
    JOIN locations l ON l.id = mr.location_id
    ${whereSql}
    GROUP BY l.id
    ORDER BY (COALESCE(SUM(mr.material_cost), 0) + COALESCE(SUM(mr.labor_cost), 0)) DESC, l.name ASC
  `).all(...params).map((row) => {
    const materialCost = Number(row.total_material_cost || 0);
    const laborCost = Number(row.total_labor_cost || 0);
    return {
      id: row.id,
      name: row.name,
      totalActivities: Number(row.total_activities || 0),
      totalMaterialCost: materialCost,
      totalLaborCost: laborCost,
      totalCost: materialCost + laborCost,
    };
  });

  const records = db.prepare(`
    ${maintenanceSelectSql}
    ${whereSql}
    ORDER BY mr.maintenance_date DESC, mr.id DESC
  `).all(...params).map(formatMaintenanceRow);

  const totalMaterialCost = Number(totalsRow.total_material_cost || 0);
  const totalLaborCost = Number(totalsRow.total_labor_cost || 0);

  res.json({
    startDate: req.query.startDate || null,
    endDate: req.query.endDate || null,
    totals: {
      totalActivities: Number(totalsRow.total_activities || 0),
      totalMaterialCost,
      totalLaborCost,
      totalCost: totalMaterialCost + totalLaborCost,
    },
    byType,
    byLocation,
    records,
  });
});

export default router;
