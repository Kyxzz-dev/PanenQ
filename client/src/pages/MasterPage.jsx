import { Plus, MapPinned, Users, Pencil, Trash2 } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';

export default function MasterPage({ type, rows, onAdd, onEdit, onDelete }) {
  const isLocation = type === 'location';

  return (
    <>
      <PageHeading
        eyebrow="DATA MASTER"
        title={isLocation ? 'Lokasi / Blok' : 'Data Pemanen'}
        description={
          isLocation
            ? 'Kelola daftar lokasi atau blok kebun.'
            : 'Kelola daftar pekerja yang melakukan pemanenan.'
        }
        action={
          <button className="btn btn-primary" onClick={onAdd} type="button">
            <Plus size={17} /> Tambah {isLocation ? 'Lokasi' : 'Pemanen'}
          </button>
        }
      />
      <div className="master-grid">
        {rows.map((r) => (
          <div className="master-card" key={r.id}>
            <div className="master-icon">
              {isLocation ? <MapPinned size={20} /> : <Users size={20} />}
            </div>
            <div className="master-card-main">
              <b>{r.name}</b>
              <span>
                {isLocation
                  ? r.description || 'Lokasi kebun'
                  : r.employee_code || 'Kode pekerja belum diisi'}
              </span>
              {!isLocation && (
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      background: r.is_active ? '#eaf5ec' : '#f5f5f5',
                      color: r.is_active ? '#2e7049' : '#888',
                    }}
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: r.is_active ? '#46ad68' : '#aaa',
                      }}
                    />
                    {r.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              )}
            </div>
            <div className="master-card-count">
              {r.record_count || 0}
              <small>catatan</small>
            </div>
            <div className="row-actions">
              <button className="icon-btn small" onClick={() => onEdit(r)} type="button">
                <Pencil size={15} />
              </button>
              <button
                className="icon-btn small danger"
                onClick={() => onDelete(r.id)}
                type="button"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!rows.length && (
          <div className="panel empty-master">
            <div className="empty-icon">
              <Plus size={24} />
            </div>
            <b>Belum ada data master</b>
            <span>Tambahkan data pertama untuk mulai mencatat panen.</span>
            <button className="btn btn-primary" onClick={onAdd} type="button">
              Tambah data
            </button>
          </div>
        )}
      </div>
    </>
  );
}
