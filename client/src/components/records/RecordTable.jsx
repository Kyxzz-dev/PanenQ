import { ClipboardList, MapPinned, Pencil, Trash2 } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/formatters.js';

export default function RecordTable({ rows, onEdit, onDelete, compact = false }) {
  if (!rows?.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ClipboardList size={25} />
        </div>
        <b>Belum ada catatan panen</b>
        <span>Data pencatatan yang ditambahkan akan muncul di sini.</span>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TANGGAL</th>
            <th>LOKASI / BLOK</th>
            <th>PEMANEN</th>
            <th>JUMLAH TANDAN</th>
            <th>BERAT TOTAL</th>
            {!compact && <th>AKSI</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <span className="date-cell">{formatDate(r.harvest_date)}</span>
              </td>
              <td>
                <span className="location-cell">
                  <MapPinned size={14} />
                  {r.location_name}
                </span>
              </td>
              <td>{r.harvester_name || <span className="muted">—</span>}</td>
              <td>
                <b>{formatNumber(r.bunch_count)}</b> <small className="muted">tandan</small>
              </td>
              <td>
                {r.total_weight_kg == null ? (
                  <span className="muted">—</span>
                ) : (
                  `${formatNumber(r.total_weight_kg)} kg`
                )}
              </td>
              {!compact && (
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-btn small"
                      title="Edit"
                      onClick={() => onEdit(r)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn small danger"
                      title="Hapus"
                      onClick={() => onDelete(r.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
