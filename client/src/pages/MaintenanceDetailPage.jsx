import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import { api } from '../services/api.js';
import {
  MAINTENANCE_TYPE_META,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  maintenanceTypeLabel,
} from '../utils/formatters.js';

export default function MaintenanceDetailPage({
  recordId,
  initialRecord,
  onBack,
  onEdit,
  onDelete,
}) {
  const [record, setRecord] = useState(initialRecord || null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!recordId) return;
    let active = true;
    setLoading(true);
    setLoadError('');
    api
      .get(`/maintenance-records/${recordId}`)
      .then((data) => {
        if (active) setRecord(data);
      })
      .catch((err) => {
        if (active) setLoadError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [recordId]);

  const meta = MAINTENANCE_TYPE_META[record?.maintenanceType] || {};

  return (
    <>
      <PageHeading
        eyebrow="DETAIL CATATAN"
        title="Detail Perawatan Kebun"
        description="Informasi lengkap aktivitas perawatan, bahan, cakupan, dan rincian biaya."
        action={
          <div className="detail-actions">
            <button type="button" className="btn btn-outline" onClick={onBack}>
              <ArrowLeft size={16} /> Kembali
            </button>
            {record && (
              <>
                <button type="button" className="btn btn-outline" onClick={() => onEdit(record)}>
                  <Pencil size={15} /> Ubah
                </button>
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => onDelete(record.id)}
                >
                  <Trash2 size={15} /> Hapus
                </button>
              </>
            )}
          </div>
        }
      />

      {loadError && <div className="alert">{loadError}</div>}

      {!record && loading && (
        <div className="panel detail-empty">Memuat detail catatan perawatan...</div>
      )}

      {record && (
        <div className="detail-layout">
          <div className="panel detail-card">
            <div className="detail-card-head">
              <div>
                <span className={`type-badge ${meta.badgeClass || ''}`}>
                  {maintenanceTypeLabel(record.maintenanceType)}
                </span>
                <h2>{record.locationName}</h2>
                <p>Tanggal pelaksanaan: {formatDate(record.maintenanceDate)}</p>
              </div>
              <div className="detail-total-box">
                <small>Total Biaya</small>
                <b>{formatCurrency(record.totalCost)}</b>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <small>Blok Kebun</small>
                <b>{record.locationName}</b>
              </div>
              <div className="detail-item">
                <small>Pekerja</small>
                <b>{record.harvesterName || 'Tidak dicatat'}</b>
              </div>

              {record.maintenanceType === 'penyemprotan' && record.materialCategory && (
                <div className="detail-item">
                  <small>Jenis Bahan</small>
                  <b>{record.materialCategory}</b>
                </div>
              )}

              {record.maintenanceType !== 'pruning' && (
                <div className="detail-item">
                  <small>
                    {record.maintenanceType === 'pemupukan' ? 'Nama / Jenis Pupuk' : 'Nama Bahan'}
                  </small>
                  <b>{record.materialName || '-'}</b>
                </div>
              )}

              {record.maintenanceType === 'pruning' && (
                <div className="detail-item">
                  <small>Jenis Pekerjaan</small>
                  <b>{record.workType || 'Pemangkasan pelepah'}</b>
                </div>
              )}

              {record.maintenanceType !== 'pruning' && (
                <div className="detail-item">
                  <small>Dosis</small>
                  <b>
                    {record.dosage != null
                      ? `${formatNumber(record.dosage)} ${record.dosageUnit || ''}`.trim()
                      : '-'}
                  </b>
                </div>
              )}

              {record.maintenanceType !== 'pruning' && (
                <div className="detail-item">
                  <small>Jumlah Bahan</small>
                  <b>
                    {record.quantity != null
                      ? `${formatNumber(record.quantity)} ${record.quantityUnit || ''}`.trim()
                      : '-'}
                  </b>
                </div>
              )}

              {record.maintenanceType !== 'pemupukan' && (
                <div className="detail-item">
                  <small>Luas Area</small>
                  <b>
                    {record.area != null
                      ? `${formatNumber(record.area)} ${record.areaUnit || 'hektare'}`.trim()
                      : '-'}
                  </b>
                </div>
              )}

              {record.maintenanceType !== 'penyemprotan' && (
                <div className="detail-item">
                  <small>Jumlah Pohon</small>
                  <b>
                    {record.treeCount != null ? `${formatNumber(record.treeCount)} pohon` : '-'}
                  </b>
                </div>
              )}
            </div>

            <div className="detail-notes">
              <small>Catatan</small>
              <p>{record.notes || 'Tidak ada catatan tambahan.'}</p>
            </div>
          </div>

          <div className="panel detail-side-card">
            <h3>Rincian Biaya</h3>
            <div className="cost-rows">
              <div>
                <span>Biaya Bahan / Pupuk</span>
                <b>{formatCurrency(record.materialCost)}</b>
              </div>
              <div>
                <span>Biaya Tenaga Kerja</span>
                <b>{formatCurrency(record.laborCost)}</b>
              </div>
              <div className="cost-total-row">
                <span>Total Biaya</span>
                <b>{formatCurrency(record.totalCost)}</b>
              </div>
            </div>

            <div className="detail-timestamps">
              <div>
                <small>Dibuat pada</small>
                <span>{formatDateTime(record.createdAt)}</span>
              </div>
              <div>
                <small>Terakhir diubah</small>
                <span>{record.updatedAt ? formatDateTime(record.updatedAt) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
