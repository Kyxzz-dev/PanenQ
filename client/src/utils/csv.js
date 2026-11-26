import { formatNumber, maintenanceTypeLabel, today } from './formatters.js';

function triggerCsvDownload(columns, values, filename) {
  const csv = [columns, ...values]
    .map((row) => row.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows) {
  const columns = ['Tanggal', 'Lokasi', 'Pemanen', 'Jumlah Tandan', 'Berat (kg)', 'Catatan'];
  const values = rows.map((r) => [
    r.harvest_date,
    r.location_name,
    r.harvester_name || '',
    r.bunch_count,
    r.total_weight_kg ?? '',
    r.notes || '',
  ]);
  triggerCsvDownload(columns, values, `laporan-panen-${today}.csv`);
}

export function downloadMaintenanceCsv(rows, range = {}) {
  const columns = [
    'Tanggal',
    'Blok Kebun',
    'Jenis Perawatan',
    'Pekerja',
    'Kategori Bahan / Jenis Pekerjaan',
    'Nama Bahan',
    'Dosis',
    'Jumlah Bahan',
    'Luas Area',
    'Jumlah Pohon',
    'Biaya Bahan (Rp)',
    'Biaya Tenaga Kerja (Rp)',
    'Total Biaya (Rp)',
    'Catatan',
  ];

  const values = rows.map((r) => [
    r.maintenanceDate,
    r.locationName,
    maintenanceTypeLabel(r.maintenanceType),
    r.harvesterName || '',
    r.maintenanceType === 'pruning' ? r.workType || '' : r.materialCategory || '',
    r.materialName || '',
    r.dosage != null ? `${formatNumber(r.dosage)} ${r.dosageUnit || ''}`.trim() : '',
    r.quantity != null ? `${formatNumber(r.quantity)} ${r.quantityUnit || ''}`.trim() : '',
    r.area != null ? `${formatNumber(r.area)} ${r.areaUnit || ''}`.trim() : '',
    r.treeCount ?? '',
    r.materialCost ?? 0,
    r.laborCost ?? 0,
    r.totalCost ?? 0,
    r.notes || '',
  ]);

  const filename =
    range.startDate && range.endDate
      ? `laporan-perawatan-${range.startDate}-${range.endDate}.csv`
      : `laporan-perawatan-${range.startDate || range.endDate || today}.csv`;

  triggerCsvDownload(columns, values, filename);
}
