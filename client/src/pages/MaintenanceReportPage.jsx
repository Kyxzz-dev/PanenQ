import { ClipboardCheck, Coins, Download, Hammer, Package } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { downloadMaintenanceCsv } from '../utils/csv.js';
import {
  MAINTENANCE_TYPE_META,
  formatCurrency,
  formatDate,
  formatMaintenanceMaterial,
  formatMaintenanceScope,
  formatNumber,
  maintenanceTypeLabel,
} from '../utils/formatters.js';

export default function MaintenanceReportPage({
  report,
  filters,
  setFilters,
  locations,
  onDetail,
}) {
  const totals = report?.totals || {};
  const records = report?.records || [];
  const byType = report?.byType || [];
  const byLocation = report?.byLocation || [];

  const setField = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeading
        eyebrow="LAPORAN & EKSPOR"
        title="Laporan Perawatan Kebun"
        description="Rekapitulasi aktivitas dan biaya perawatan berdasarkan periode, jenis perawatan, dan blok kebun."
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => downloadMaintenanceCsv(records, filters)}
            disabled={!records.length}
          >
            <Download size={16} /> Ekspor CSV
          </button>
        }
      />

      <div className="filter-panel">
        <label>
          Dari tanggal
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
          />
        </label>
        <label>
          Sampai tanggal
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setField('endDate', e.target.value)}
          />
        </label>
        <label>
          Jenis perawatan
          <select
            value={filters.maintenanceType}
            onChange={(e) => setField('maintenanceType', e.target.value)}
          >
            <option value="">Semua jenis</option>
            <option value="pemupukan">Pemupukan</option>
            <option value="penyemprotan">Penyemprotan</option>
            <option value="pruning">Pruning</option>
          </select>
        </label>
        <label>
          Blok kebun
          <select
            value={filters.locationId}
            onChange={(e) => setField('locationId', e.target.value)}
          >
            <option value="">Semua blok</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={ClipboardCheck}
          label="Total aktivitas"
          value={formatNumber(totals.totalActivities)}
          unit="catatan"
          tone="green"
        />
        <StatCard
          icon={Package}
          label="Total biaya bahan"
          value={formatCurrency(totals.totalMaterialCost)}
          unit=""
          tone="blue"
        />
        <StatCard
          icon={Hammer}
          label="Total biaya tenaga kerja"
          value={formatCurrency(totals.totalLaborCost)}
          unit=""
          tone="purple"
        />
        <StatCard
          icon={Coins}
          label="Total biaya perawatan"
          value={formatCurrency(totals.totalCost)}
          unit=""
          tone="orange"
        />
      </div>

      <div className="report-recap-grid">
        <div>
          <div className="section-title">
            <div>
              <h3>Rekap berdasarkan jenis perawatan</h3>
              <p>Distribusi aktivitas dan biaya per jenis.</p>
            </div>
          </div>
          <div className="panel table-panel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>JENIS PERAWATAN</th>
                    <th>AKTIVITAS</th>
                    <th>BIAYA BAHAN</th>
                    <th>TENAGA KERJA</th>
                    <th>TOTAL BIAYA</th>
                  </tr>
                </thead>
                <tbody>
                  {byType.map((row) => {
                    const meta = MAINTENANCE_TYPE_META[row.maintenanceType] || {};
                    return (
                      <tr key={row.maintenanceType}>
                        <td>
                          <span className={`type-badge ${meta.badgeClass || ''}`}>
                            {maintenanceTypeLabel(row.maintenanceType)}
                          </span>
                        </td>
                        <td>{formatNumber(row.totalActivities)}</td>
                        <td>{formatCurrency(row.totalMaterialCost)}</td>
                        <td>{formatCurrency(row.totalLaborCost)}</td>
                        <td>
                          <b>{formatCurrency(row.totalCost)}</b>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="section-title">
            <div>
              <h3>Rekap berdasarkan blok kebun</h3>
              <p>Perbandingan aktivitas dan biaya per blok.</p>
            </div>
          </div>
          <div className="panel table-panel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>BLOK KEBUN</th>
                    <th>AKTIVITAS</th>
                    <th>BIAYA BAHAN</th>
                    <th>TENAGA KERJA</th>
                    <th>TOTAL BIAYA</th>
                  </tr>
                </thead>
                <tbody>
                  {byLocation.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <b>{row.name}</b>
                      </td>
                      <td>{formatNumber(row.totalActivities)}</td>
                      <td>{formatCurrency(row.totalMaterialCost)}</td>
                      <td>{formatCurrency(row.totalLaborCost)}</td>
                      <td>
                        <b>{formatCurrency(row.totalCost)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!byLocation.length && (
                <div className="empty-state">Belum ada data pada periode ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title table-section-heading">
        <div>
          <h3>Rincian catatan perawatan</h3>
          <p>Data di bawah siap diekspor ke CSV sesuai filter periode.</p>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>BLOK KEBUN</th>
                <th>JENIS PERAWATAN</th>
                <th>NAMA BAHAN / PEKERJAAN</th>
                <th>JUMLAH BAHAN</th>
                <th>LUAS / POHON</th>
                <th>BIAYA BAHAN</th>
                <th>BIAYA TENAGA</th>
                <th>TOTAL BIAYA</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const meta = MAINTENANCE_TYPE_META[r.maintenanceType] || {};
                return (
                  <tr
                    key={r.id}
                    className="clickable-row"
                    onClick={() => onDetail(r)}
                    title="Klik untuk melihat detail"
                  >
                    <td>
                      <span className="date-cell">{formatDate(r.maintenanceDate)}</span>
                    </td>
                    <td>
                      <b>{r.locationName}</b>
                    </td>
                    <td>
                      <span className={`type-badge ${meta.badgeClass || ''}`}>
                        {maintenanceTypeLabel(r.maintenanceType)}
                      </span>
                    </td>
                    <td>{formatMaintenanceMaterial(r)}</td>
                    <td>
                      {r.quantity != null
                        ? `${formatNumber(r.quantity)}${r.quantityUnit ? ` ${r.quantityUnit}` : ''}`
                        : '-'}
                    </td>
                    <td>{formatMaintenanceScope(r)}</td>
                    <td>{formatCurrency(r.materialCost)}</td>
                    <td>{formatCurrency(r.laborCost)}</td>
                    <td>
                      <b>{formatCurrency(r.totalCost)}</b>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!records.length && (
            <div className="empty-state">Belum ada catatan perawatan pada periode ini.</div>
          )}
        </div>
      </div>
    </>
  );
}
