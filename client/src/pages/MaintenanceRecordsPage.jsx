import { Download, Plus, RotateCcw, Search } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import MaintenanceTable from '../components/maintenance/MaintenanceTable.jsx';
import { downloadMaintenanceCsv } from '../utils/csv.js';
import { formatCurrency } from '../utils/formatters.js';

export default function MaintenanceRecordsPage({
  records,
  locations,
  harvesters,
  filters,
  setFilters,
  onAdd,
  onDetail,
  onEdit,
  onDelete,
}) {
  const totalCost = records.reduce((sum, r) => sum + Number(r.totalCost || 0), 0);
  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      locationId: '',
      maintenanceType: '',
      harvesterId: '',
      sort: 'newest',
    });

  return (
    <>
      <PageHeading
        eyebrow="RIWAYAT PERAWATAN"
        title="Daftar Perawatan Kebun"
        description="Cari, filter, lihat detail, dan kelola seluruh catatan pemupukan, penyemprotan, dan pruning."
        action={
          <button className="btn btn-primary" onClick={onAdd} type="button">
            <Plus size={17} /> Tambah Perawatan
          </button>
        }
      />

      <div className="filter-panel maintenance-filter-panel">
        <label className="search-input-label">
          Cari nama blok
          <div className="input-with-icon">
            <Search size={15} />
            <input
              type="text"
              placeholder="Contoh: Blok A"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
        </label>
        <label>
          Dari tanggal
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilter('startDate', e.target.value)}
          />
        </label>
        <label>
          Sampai tanggal
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilter('endDate', e.target.value)}
          />
        </label>
        <label>
          Blok kebun
          <select
            value={filters.locationId}
            onChange={(e) => setFilter('locationId', e.target.value)}
          >
            <option value="">Semua blok</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Jenis perawatan
          <select
            value={filters.maintenanceType}
            onChange={(e) => setFilter('maintenanceType', e.target.value)}
          >
            <option value="">Semua jenis</option>
            <option value="pemupukan">Pemupukan</option>
            <option value="penyemprotan">Penyemprotan</option>
            <option value="pruning">Pruning</option>
          </select>
        </label>
        <label>
          Pekerja
          <select
            value={filters.harvesterId}
            onChange={(e) => setFilter('harvesterId', e.target.value)}
          >
            <option value="">Semua pekerja</option>
            {harvesters.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Urutkan
          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </label>
        <div className="filter-actions">
          <button
            type="button"
            className="btn btn-outline export-btn"
            onClick={resetFilters}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            type="button"
            className="btn btn-outline export-btn"
            onClick={() => downloadMaintenanceCsv(records, filters)}
            disabled={!records.length}
          >
            <Download size={16} /> Ekspor CSV
          </button>
        </div>
      </div>

      <div className="list-summary">
        <span>
          <b>{records.length}</b> catatan perawatan ditemukan
        </span>
        <span>
          Total biaya hasil filter: <b>{formatCurrency(totalCost)}</b>
        </span>
      </div>

      <div className="panel table-panel">
        <MaintenanceTable
          rows={records}
          onDetail={onDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}
