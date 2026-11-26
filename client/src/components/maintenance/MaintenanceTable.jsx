import { Eye, MapPinned, Pencil, Sprout, Trash2 } from 'lucide-react';
import {
  MAINTENANCE_TYPE_META,
  formatCurrency,
  formatDate,
  formatMaintenanceMaterial,
  formatMaintenanceScope,
  maintenanceTypeLabel,
} from '../../utils/formatters.js';

export default function MaintenanceTable({
  rows,
  onDetail,
  onEdit,
  onDelete,
  compact = false,
}) {
  if (!rows?.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Sprout size={25} />
        </div>
        <b>Belum ada catatan perawatan</b>
        <span>Tambahkan aktivitas pemupukan, penyemprotan, atau pruning untuk mulai memantau.</span>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TANGGAL</th>
            <th>BLOK KEBUN</th>
            <th>JENIS PERAWATAN</th>
            <th>BAHAN / PEKERJAAN</th>
            <th>VOLUME / CAKUPAN</th>
            {!compact && <th>PEKERJA</th>}
            <th>TOTAL BIAYA</th>
            <th>AKSI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const typeMeta = MAINTENANCE_TYPE_META[r.maintenanceType] || {};
            return (
              <tr key={r.id}>
                <td>
                  <span className="date-cell">{formatDate(r.maintenanceDate)}</span>
                </td>
                <td>
                  <span className="location-cell">
                    <MapPinned size={14} />
                    {r.locationName}
                  </span>
                </td>
                <td>
                  <span className={`type-badge ${typeMeta.badgeClass || ''}`}>
                    {maintenanceTypeLabel(r.maintenanceType)}
                  </span>
                </td>
                <td>{formatMaintenanceMaterial(r)}</td>
                <td>{formatMaintenanceScope(r)}</td>
                {!compact && <td>{r.harvesterName || <span className="muted">—</span>}</td>}
                <td>
                  <b>{formatCurrency(r.totalCost)}</b>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-btn small"
                      title="Detail"
                      onClick={() => onDetail(r)}
                    >
                      <Eye size={15} />
                    </button>
                    {!compact && onEdit && (
                      <button
                        type="button"
                        className="icon-btn small"
                        title="Edit"
                        onClick={() => onEdit(r)}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {!compact && onDelete && (
                      <button
                        type="button"
                        className="icon-btn small danger"
                        title="Hapus"
                        onClick={() => onDelete(r.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
