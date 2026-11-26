import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  MapPinOff,
  Plus,
  RotateCcw,
  Sprout,
} from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import StatCard from '../components/common/StatCard.jsx';
import MaintenanceTable from '../components/maintenance/MaintenanceTable.jsx';
import {
  MAINTENANCE_TYPE_META,
  formatCurrency,
  formatDate,
  formatNumber,
  maintenanceTypeLabel,
} from '../utils/formatters.js';

export default function MaintenanceDashboardPage({
  summary,
  range,
  setRange,
  onAdd,
  onDetail,
  onNavigate,
  onFilterByType,
}) {
  const totals = summary?.totals || {};
  const byType = summary?.byType || [];
  const treatedBlocks = summary?.treatedBlocks || [];
  const untreatedBlocks = summary?.untreatedBlocks || [];

  const setField = (key, value) => setRange((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeading
        eyebrow="PERAWATAN KEBUN"
        title="Dashboard Perawatan"
        description="Pantau ringkasan pemupukan, penyemprotan, pruning, serta cakupan blok kebun."
        action={
          <button className="btn btn-primary" onClick={onAdd} type="button">
            <Plus size={17} /> Tambah Perawatan
          </button>
        }
      />

      <div className="filter-panel">
        <div className="search-field">
          <Sprout size={16} />
          <span>Periode ringkasan</span>
        </div>
        <label>
          Dari tanggal
          <input
            type="date"
            value={range.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
          />
        </label>
        <label>
          Sampai tanggal
          <input
            type="date"
            value={range.endDate}
            onChange={(e) => setField('endDate', e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-outline export-btn"
          onClick={() => setRange({ startDate: '', endDate: '' })}
        >
          <RotateCcw size={15} /> Semua Periode
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={ClipboardCheck}
          label="Total aktivitas perawatan"
          value={formatNumber(totals.totalActivities)}
          unit="aktivitas"
          tone="green"
        />
        <StatCard
          icon={Coins}
          label="Total biaya perawatan"
          value={formatCurrency(totals.totalCost)}
          unit=""
          tone="orange"
        />
        <StatCard
          icon={CheckCircle2}
          label="Blok sudah dirawat"
          value={`${formatNumber(totals.treatedBlocksCount)} / ${formatNumber(totals.totalBlocksCount)}`}
          unit="blok"
          tone="blue"
        />
        <StatCard
          icon={MapPinOff}
          label="Blok belum dirawat"
          value={formatNumber(totals.untreatedBlocksCount)}
          unit="blok"
          tone="purple"
        />
      </div>

      <div className="section-title">
        <div>
          <h3>Ringkasan per jenis perawatan</h3>
          <p>Klik jenis perawatan untuk melihat daftar catatannya.</p>
        </div>
      </div>
      <div className="maintenance-type-grid">
        {byType.map((item) => {
          const meta = MAINTENANCE_TYPE_META[item.maintenanceType] || {};
          return (
            <button
              key={item.maintenanceType}
              type="button"
              className="panel type-summary-card"
              onClick={() => onFilterByType(item.maintenanceType)}
            >
              <div className="type-summary-top">
                <span className={`type-badge ${meta.badgeClass || ''}`}>
                  {maintenanceTypeLabel(item.maintenanceType)}
                </span>
                <span className="muted-link">
                  Lihat <ArrowUpRight size={14} />
                </span>
              </div>
              <div className="type-summary-main">
                <b>{formatNumber(item.totalActivities)}</b>
                <span>aktivitas</span>
              </div>
              <div className="type-summary-cost">
                <div>
                  <small>Total biaya</small>
                  <b>{formatCurrency(item.totalCost)}</b>
                </div>
                <div>
                  <small>Bahan / Tenaga</small>
                  <span>
                    {formatCurrency(item.totalMaterialCost)} / {formatCurrency(item.totalLaborCost)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="section-title table-section-heading">
        <div>
          <h3>Status perawatan blok kebun</h3>
          <p>Perbandingan blok yang sudah dan belum mendapatkan perawatan pada periode terpilih.</p>
        </div>
      </div>
      <div className="block-status-grid">
        <div className="panel block-status-panel">
          <div className="block-status-head">
            <span className="type-badge badge-green">Sudah Dirawat ({treatedBlocks.length})</span>
          </div>
          {treatedBlocks.length ? (
            <ul className="block-list">
              {treatedBlocks.map((b) => (
                <li key={b.id}>
                  <div>
                    <b>{b.name}</b>
                    <small>Terakhir: {formatDate(b.lastMaintenanceDate)}</small>
                  </div>
                  <div className="block-list-meta">
                    <b>{b.totalActivities}x</b>
                    <small>{formatCurrency(b.totalCost)}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="block-empty">Belum ada blok yang dirawat pada periode ini.</div>
          )}
        </div>

        <div className="panel block-status-panel">
          <div className="block-status-head">
            <span className="type-badge badge-muted">Belum Dirawat ({untreatedBlocks.length})</span>
          </div>
          {untreatedBlocks.length ? (
            <ul className="block-list">
              {untreatedBlocks.map((b) => (
                <li key={b.id}>
                  <div>
                    <b>{b.name}</b>
                    <small>{b.description || 'Belum ada catatan perawatan'}</small>
                  </div>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={onAdd}
                  >
                    Catat <ArrowUpRight size={13} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="block-empty">Semua blok kebun sudah mendapatkan perawatan.</div>
          )}
        </div>
      </div>

      <div className="section-title table-section-heading">
        <div>
          <h3>Aktivitas perawatan terbaru</h3>
          <p>Enam catatan perawatan terakhir pada periode terpilih.</p>
        </div>
        <button
          className="text-btn"
          onClick={() => onNavigate('maintenance-records')}
          type="button"
        >
          Lihat semua <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="panel table-panel">
        <MaintenanceTable
          rows={summary?.recent || []}
          onDetail={onDetail}
          compact
        />
      </div>
    </>
  );
}
