import { Router } from 'express';
import db from '../config/database.js';
import {
  optionalNonNegativeInteger,
  optionalNonNegativeNumber,
  positiveInteger,
  validDate,
} from '../utils/validation.js';

const router = Router();

export const MAINTENANCE_TYPES = ['pemupukan', 'penyemprotan', 'pruning'];

export const maintenanceSelectSql = `
  SELECT mr.*, l.name AS location_name, h.name AS harvester_name
  FROM maintenance_records mr
  JOIN locations l ON l.id = mr.location_id
  LEFT JOIN harvesters h ON h.id = mr.harvester_id
`;

export function formatMaintenanceRow(row) {
  const materialCost = Number(row.material_cost || 0);
  const laborCost = Number(row.labor_cost || 0);
  return {
    id: row.id,
    locationId: row.location_id,
    locationName: row.location_name,
    harvesterId: row.harvester_id ?? null,
    harvesterName: row.harvester_name ?? null,
    maintenanceType: row.maintenance_type,
    maintenanceDate: row.maintenance_date,
    materialCategory: row.material_category ?? null,
    materialName: row.material_name ?? null,
    workType: row.work_type ?? null,
    dosage: row.dosage ?? null,
    dosageUnit: row.dosage_unit ?? null,
    quantity: row.quantity ?? null,
    quantityUnit: row.quantity_unit ?? null,
    area: row.area ?? null,
    areaUnit: row.area_unit ?? null,
    treeCount: row.tree_count ?? null,
    materialCost,
    laborCost,
    totalCost: materialCost + laborCost,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

function cleanText(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
}

function toCostNumber(value) {
  if (value === undefined || value === null || value === '') return 0;
  return Number(value);
}

function validateAndNormalizePayload(body) {
  const locationId = body.locationId ?? body.location_id;
  const harvesterId = body.harvesterId ?? body.harvester_id;
  const maintenanceType = cleanText(body.maintenanceType ?? body.maintenance_type);
  const maintenanceDate = body.maintenanceDate ?? body.maintenance_date;
  const materialCategory = cleanText(body.materialCategory ?? body.material_category);
  const materialName = cleanText(body.materialName ?? body.material_name);
  const workType = cleanText(body.workType ?? body.work_type);
  const dosage = body.dosage;
  const dosageUnit = cleanText(body.dosageUnit ?? body.dosage_unit);
  const quantity = body.quantity;
  const quantityUnit = cleanText(body.quantityUnit ?? body.quantity_unit);
  const area = body.area;
  const areaUnit = cleanText(body.areaUnit ?? body.area_unit);
  const treeCount = body.treeCount ?? body.tree_count;
  const materialCost = body.materialCost ?? body.material_cost;
  const laborCost = body.laborCost ?? body.labor_cost;
  const notes = cleanText(body.notes);

  if (!positiveInteger(locationId)) {
    return { error: 'Blok kebun wajib dipilih.' };
  }
  const location = db.prepare('SELECT id FROM locations WHERE id = ?').get(Number(locationId));
  if (!location) {
    return { error: 'Blok kebun tidak ditemukan.' };
  }

  let normalizedHarvesterId = null;
  if (harvesterId !== undefined && harvesterId !== null && harvesterId !== '') {
    if (!positiveInteger(harvesterId)) {
      return { error: 'ID pekerja tidak valid.' };
    }
    const harvester = db.prepare('SELECT id FROM harvesters WHERE id = ?').get(Number(harvesterId));
    if (!harvester) {
      return { error: 'Pekerja tidak ditemukan.' };
    }
    normalizedHarvesterId = Number(harvesterId);
  }

  if (!maintenanceType || !MAINTENANCE_TYPES.includes(maintenanceType)) {
    return { error: 'Jenis perawatan harus berupa pemupukan, penyemprotan, atau pruning.' };
  }

  if (!validDate(maintenanceDate)) {
    return { error: 'Tanggal perawatan tidak valid.' };
  }

  if (!optionalNonNegativeNumber(dosage)) {
    return { error: 'Dosis tidak boleh bernilai negatif.' };
  }
  if (!optionalNonNegativeNumber(quantity)) {
    return { error: 'Jumlah bahan tidak boleh bernilai negatif.' };
  }
  if (!optionalNonNegativeNumber(area)) {
    return { error: 'Luas area tidak boleh bernilai negatif.' };
  }
  if (!optionalNonNegativeInteger(treeCount)) {
    return { error: 'Jumlah pohon harus bilangan bulat nol atau positif.' };
  }
  if (!optionalNonNegativeNumber(materialCost)) {
    return { error: 'Biaya bahan tidak boleh bernilai negatif.' };
  }
  if (!optionalNonNegativeNumber(laborCost)) {
    return { error: 'Biaya tenaga kerja tidak boleh bernilai negatif.' };
  }

  if (maintenanceType === 'pemupukan') {
    if (!materialName) {
      return { error: 'Nama atau jenis pupuk wajib diisi untuk perawatan pemupukan.' };
    }
    return {
      data: {
        locationId: Number(locationId),
        harvesterId: normalizedHarvesterId,
        maintenanceType,
        maintenanceDate,
        materialCategory: null,
        materialName,
        workType: null,
        dosage: toNullableNumber(dosage),
        dosageUnit: dosage !== undefined && dosage !== null && dosage !== '' ? dosageUnit : dosageUnit,
        quantity: toNullableNumber(quantity),
        quantityUnit,
        area: null,
        areaUnit: null,
        treeCount: toNullableNumber(treeCount),
        materialCost: toCostNumber(materialCost),
        laborCost: toCostNumber(laborCost),
        notes,
      },
    };
  }

  if (maintenanceType === 'penyemprotan') {
    if (!materialName && !materialCategory) {
      return { error: 'Jenis atau nama bahan semprot wajib diisi untuk penyemprotan.' };
    }
    return {
      data: {
        locationId: Number(locationId),
        harvesterId: normalizedHarvesterId,
        maintenanceType,
        maintenanceDate,
        materialCategory,
        materialName: materialName || materialCategory,
        workType: null,
        dosage: toNullableNumber(dosage),
        dosageUnit,
        quantity: toNullableNumber(quantity),
        quantityUnit,
        area: toNullableNumber(area),
        areaUnit,
        treeCount: null,
        materialCost: toCostNumber(materialCost),
        laborCost: toCostNumber(laborCost),
        notes,
      },
    };
  }

  return {
    data: {
      locationId: Number(locationId),
      harvesterId: normalizedHarvesterId,
      maintenanceType,
      maintenanceDate,
      materialCategory: null,
      materialName: null,
      workType: workType || 'Pemangkasan pelepah',
      dosage: null,
      dosageUnit: null,
      quantity: null,
      quantityUnit: null,
      area: toNullableNumber(area),
      areaUnit: area !== undefined && area !== null && area !== '' ? areaUnit : null,
      treeCount: toNullableNumber(treeCount),
      materialCost: 0,
      laborCost: toCostNumber(laborCost),
      notes,
    },
  };
}

export function buildMaintenanceFilterClause(query) {
  const { startDate, endDate, locationId, maintenanceType, harvesterId, search } = query;
  const where = [];
  const params = [];

  if (startDate) {
    if (!validDate(startDate)) return { error: 'Format startDate tidak valid.' };
    where.push('mr.maintenance_date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    if (!validDate(endDate)) return { error: 'Format endDate tidak valid.' };
    where.push('mr.maintenance_date <= ?');
    params.push(endDate);
  }
  if (locationId) {
    if (!positiveInteger(locationId)) return { error: 'Parameter locationId tidak valid.' };
    where.push('mr.location_id = ?');
    params.push(Number(locationId));
  }
  if (maintenanceType) {
    if (!MAINTENANCE_TYPES.includes(maintenanceType)) {
      return { error: 'Parameter maintenanceType tidak valid.' };
    }
    where.push('mr.maintenance_type = ?');
    params.push(maintenanceType);
  }
  if (harvesterId) {
    if (!positiveInteger(harvesterId)) return { error: 'Parameter harvesterId tidak valid.' };
    where.push('mr.harvester_id = ?');
    params.push(Number(harvesterId));
  }
  if (search && String(search).trim()) {
    where.push('LOWER(l.name) LIKE LOWER(?)');
    params.push(`%${String(search).trim()}%`);
  }

  return { where, params };
}

router.get('/', (req, res) => {
  const { where, params, error } = buildMaintenanceFilterClause(req.query);
  if (error) return res.status(400).json({ message: error });

  const sortOrder = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
  const sql = `
    ${maintenanceSelectSql}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY mr.maintenance_date ${sortOrder}, mr.id ${sortOrder}
  `;
  const rows = db.prepare(sql).all(...params).map(formatMaintenanceRow);
  res.json(rows);
});

router.get('/summary', (req, res) => {
  const { startDate, endDate } = req.query;
  const where = [];
  const params = [];

  if (startDate) {
    if (!validDate(startDate)) return res.status(400).json({ message: 'Format startDate tidak valid.' });
    where.push('mr.maintenance_date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    if (!validDate(endDate)) return res.status(400).json({ message: 'Format endDate tidak valid.' });
    where.push('mr.maintenance_date <= ?');
    params.push(endDate);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalsRow = db.prepare(`
    SELECT
      COUNT(*) AS total_activities,
      COALESCE(SUM(mr.material_cost), 0) AS total_material_cost,
      COALESCE(SUM(mr.labor_cost), 0) AS total_labor_cost,
      COUNT(DISTINCT mr.location_id) AS treated_blocks_count
    FROM maintenance_records mr
    ${whereSql}
  `).get(...params);

  const totalBlocksRow = db.prepare('SELECT COUNT(*) AS total_blocks_count FROM locations').get();

  const byTypeRows = db.prepare(`
    SELECT
      mr.maintenance_type,
      COUNT(*) AS total_activities,
      COALESCE(SUM(mr.material_cost), 0) AS total_material_cost,
      COALESCE(SUM(mr.labor_cost), 0) AS total_labor_cost
    FROM maintenance_records mr
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

  const treatedBlocks = db.prepare(`
    SELECT
      l.id,
      l.name,
      COUNT(mr.id) AS total_activities,
      COALESCE(SUM(mr.material_cost + mr.labor_cost), 0) AS total_cost,
      MAX(mr.maintenance_date) AS last_maintenance_date
    FROM locations l
    JOIN maintenance_records mr ON mr.location_id = l.id
    ${whereSql}
    GROUP BY l.id
    ORDER BY last_maintenance_date DESC, l.name ASC
  `).all(...params).map((row) => ({
    id: row.id,
    name: row.name,
    totalActivities: Number(row.total_activities || 0),
    totalCost: Number(row.total_cost || 0),
    lastMaintenanceDate: row.last_maintenance_date,
  }));

  const treatedIds = new Set(treatedBlocks.map((b) => b.id));
  const untreatedBlocks = db.prepare('SELECT id, name, description FROM locations ORDER BY name ASC')
    .all()
    .filter((loc) => !treatedIds.has(loc.id));

  const recent = db.prepare(`
    ${maintenanceSelectSql}
    ${whereSql}
    ORDER BY mr.maintenance_date DESC, mr.id DESC
    LIMIT 6
  `).all(...params).map(formatMaintenanceRow);

  const totalMaterialCost = Number(totalsRow.total_material_cost || 0);
  const totalLaborCost = Number(totalsRow.total_labor_cost || 0);
  const totalBlocksCount = Number(totalBlocksRow.total_blocks_count || 0);
  const treatedBlocksCount = Number(totalsRow.treated_blocks_count || 0);

  res.json({
    startDate: startDate || null,
    endDate: endDate || null,
    totals: {
      totalActivities: Number(totalsRow.total_activities || 0),
      totalMaterialCost,
      totalLaborCost,
      totalCost: totalMaterialCost + totalLaborCost,
      treatedBlocksCount,
      totalBlocksCount,
      untreatedBlocksCount: Math.max(0, totalBlocksCount - treatedBlocksCount),
    },
    byType,
    treatedBlocks,
    untreatedBlocks,
    recent,
  });
});

router.get('/:id', (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ message: 'ID catatan perawatan tidak valid.' });
  }
  const row = db.prepare(`${maintenanceSelectSql} WHERE mr.id = ?`).get(Number(req.params.id));
  if (!row) {
    return res.status(404).json({ message: 'Catatan perawatan tidak ditemukan.' });
  }
  res.json(formatMaintenanceRow(row));
});

router.post('/', (req, res) => {
  const { error, data } = validateAndNormalizePayload(req.body);
  if (error) return res.status(400).json({ message: error });

  const result = db.prepare(`
    INSERT INTO maintenance_records (
      location_id, harvester_id, maintenance_type, maintenance_date,
      material_category, material_name, work_type,
      dosage, dosage_unit, quantity, quantity_unit,
      area, area_unit, tree_count, material_cost, labor_cost, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.locationId,
    data.harvesterId,
    data.maintenanceType,
    data.maintenanceDate,
    data.materialCategory,
    data.materialName,
    data.workType,
    data.dosage,
    data.dosageUnit,
    data.quantity,
    data.quantityUnit,
    data.area,
    data.areaUnit,
    data.treeCount,
    data.materialCost,
    data.laborCost,
    data.notes
  );

  const created = db.prepare(`${maintenanceSelectSql} WHERE mr.id = ?`).get(result.lastInsertRowid);
  res.status(201).json({
    success: true,
    message: 'Catatan perawatan berhasil ditambahkan.',
    data: formatMaintenanceRow(created),
  });
});

router.put('/:id', (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ message: 'ID catatan perawatan tidak valid.' });
  }
  const existing = db.prepare('SELECT id FROM maintenance_records WHERE id = ?').get(Number(req.params.id));
  if (!existing) {
    return res.status(404).json({ message: 'Catatan perawatan tidak ditemukan.' });
  }

  const { error, data } = validateAndNormalizePayload(req.body);
  if (error) return res.status(400).json({ message: error });

  db.prepare(`
    UPDATE maintenance_records
    SET
      location_id = ?,
      harvester_id = ?,
      maintenance_type = ?,
      maintenance_date = ?,
      material_category = ?,
      material_name = ?,
      work_type = ?,
      dosage = ?,
      dosage_unit = ?,
      quantity = ?,
      quantity_unit = ?,
      area = ?,
      area_unit = ?,
      tree_count = ?,
      material_cost = ?,
      labor_cost = ?,
      notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    data.locationId,
    data.harvesterId,
    data.maintenanceType,
    data.maintenanceDate,
    data.materialCategory,
    data.materialName,
    data.workType,
    data.dosage,
    data.dosageUnit,
    data.quantity,
    data.quantityUnit,
    data.area,
    data.areaUnit,
    data.treeCount,
    data.materialCost,
    data.laborCost,
    data.notes,
    Number(req.params.id)
  );

  const updated = db.prepare(`${maintenanceSelectSql} WHERE mr.id = ?`).get(Number(req.params.id));
  res.json({
    success: true,
    message: 'Catatan perawatan berhasil diperbarui.',
    data: formatMaintenanceRow(updated),
  });
});

router.delete('/:id', (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ message: 'ID catatan perawatan tidak valid.' });
  }
  const result = db.prepare('DELETE FROM maintenance_records WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) {
    return res.status(404).json({ message: 'Catatan perawatan tidak ditemukan.' });
  }
  res.json({ success: true, message: 'Catatan perawatan berhasil dihapus.' });
});

export default router;
