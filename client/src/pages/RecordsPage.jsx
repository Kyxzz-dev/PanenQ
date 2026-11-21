import { Plus, Search, Download } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import RecordTable from '../components/records/RecordTable.jsx';
import { downloadCsv } from '../utils/csv.js';
import { formatNumber } from '../utils/formatters.js';

export default function RecordsPage({
  records,
  locations,
  harvesters,
  filters,
  setFilters,
  onAdd,
  onEdit,
  onDelete,
}) {
  const totalBunches = records.reduce((sum, r) => sum + Number(r.bunch_count), 0);

  const setFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  return (
    <>
      <PageHeading
        eyebrow="PENGELOLAAN DATA"
        title="Catatan Panen"
        description="Tambah, cari, dan kelola seluruh pencatatan hasil panen."
        action={
          <button className="btn btn-primary" onClick={onAdd} type="button">
            <Plus size={17} /> Catat Panen
          </button>
        }
      />
      <div className="filter-panel">
        <div className="search-field">
          <Search size={16} />
          <span>Filter data panen</span>
        </div>
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
          Lokasi
          <select
            value={filters.locationId}
            onChange={(e) => setFilter('locationId', e.target.value)}
          >
            <option value="">Semua lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Pemanen
          <select
            value={filters.harvesterId}
            onChange={(e) => setFilter('harvesterId', e.target.value)}
          >
            <option value="">Semua pemanen</option>
            {harvesters.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-outline export-btn"
          onClick={() => downloadCsv(records)}
          type="button"
        >
          <Download size={16} /> Ekspor CSV
        </button>
      </div>
      <div className="list-summary">
        <span>
          <b>{records.length}</b> catatan ditemukan
        </span>
        <span>
          Total <b>{formatNumber(totalBunches)}</b> tandan pada hasil filter
        </span>
      </div>
      <div className="panel table-panel">
        <RecordTable rows={records} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </>
  );
}
