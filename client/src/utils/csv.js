import { today } from './formatters.js';

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
  const csv = [columns, ...values]
    .map((row) => row.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-panen-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
