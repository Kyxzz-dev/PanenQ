import { Boxes, Weight, ClipboardList } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { formatNumber } from '../utils/formatters.js';

export default function ReportsPage({ report, range, setRange }) {
  const totals = report?.totals || {};

  const setRangeField = (key, value) => setRange((p) => ({ ...p, [key]: value }));

  return (
    <>
      <PageHeading
        eyebrow="ANALISIS HASIL"
        title="Laporan Panen"
        description="Rekapitulasi hasil panen berdasarkan periode dan lokasi."
      />
      <div className="filter-panel report-filter">
        <label>
          Dari tanggal
          <input
            type="date"
            value={range.startDate}
            onChange={(e) => setRangeField('startDate', e.target.value)}
          />
        </label>
        <label>
          Sampai tanggal
          <input
            type="date"
            value={range.endDate}
            onChange={(e) => setRangeField('endDate', e.target.value)}
          />
        </label>
      </div>
      <div className="stats-grid report-stats">
        <StatCard
          icon={Boxes}
          label="Total tandan"
          value={formatNumber(totals.total_bunches)}
          unit="tandan"
          tone="green"
        />
        <StatCard
          icon={Weight}
          label="Total berat"
          value={formatNumber(totals.total_weight_kg)}
          unit="kg"
          tone="orange"
        />
        <StatCard
          icon={ClipboardList}
          label="Jumlah transaksi"
          value={formatNumber(totals.total_records)}
          unit="catatan"
          tone="blue"
        />
      </div>
      <div className="section-title">
        <div>
          <h3>Hasil panen per lokasi</h3>
          <p>Perbandingan jumlah tandan pada periode terpilih.</p>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>LOKASI / BLOK</th>
                <th>JUMLAH TRANSAKSI</th>
                <th>TOTAL TANDAN</th>
                <th>BERAT TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {(report?.byLocation || []).map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.name}</b>
                  </td>
                  <td>{formatNumber(r.total_records)}</td>
                  <td>
                    <b>{formatNumber(r.total_bunches)}</b> tandan
                  </td>
                  <td>{formatNumber(r.total_weight_kg)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!report?.byLocation?.length && (
            <div className="empty-state">Belum ada data pada periode ini.</div>
          )}
        </div>
      </div>
    </>
  );
}
