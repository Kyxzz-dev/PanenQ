import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileJson,
  MapPinned,
  Pencil,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import GeoJsonPreview from '../components/masters/GeoJsonPreview.jsx';
import { api } from '../services/api.js';

function countPoints(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) return 0;
  const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];
  let total = 0;
  for (const poly of polygons) {
    for (const ring of poly) total += ring.length;
  }
  return total;
}

export default function LocationDetailPage({ locationId, initialLocation, onBack, onEdit }) {
  const [location, setLocation] = useState(initialLocation || null);
  const [geojson, setGeojson] = useState(null);
  const [loading, setLoading] = useState(!initialLocation);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [errorGeo, setErrorGeo] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const loc = await api.get(`/locations/${locationId}`);
        if (!active) return;
        setLocation(loc);

        if (loc.hasGeojson) {
          setLoadingGeo(true);
          setErrorGeo('');
          try {
            const res = await api.get(`/locations/${locationId}/geojson`);
            if (active) setGeojson(res.geojson);
          } catch (e) {
            if (active) setErrorGeo(e.message || 'Gagal memuat GeoJSON.');
          } finally {
            if (active) setLoadingGeo(false);
          }
        } else {
          setGeojson(null);
        }
      } catch (e) {
        if (active) setLoadError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [locationId]);

  const pointCount = useMemo(() => countPoints(geojson), [geojson]);

  function exportGeoJson() {
    if (!geojson) return;
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(location?.name || 'lokasi').toLowerCase().replace(/\s+/g, '-')}-batas.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload(file) {
    setUploadError('');
    setActionMsg('');
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await api.put(`/locations/${locationId}/geojson`, { geojson: parsed });
      const refreshed = await api.get(`/locations/${locationId}/geojson`);
      setGeojson(refreshed.geojson);
      setLocation((prev) => ({ ...prev, hasGeojson: true }));
      setActionMsg('Batas GeoJSON berhasil diperbarui.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setUploadError(e.message || 'Gagal mengunggah GeoJSON.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function deleteGeoJson() {
    if (
      !window.confirm(
        'Hapus batas GeoJSON dari lokasi ini? Batas geografis akan dihapus, tetapi lokasi tetap ada.'
      )
    )
      return;
    try {
      await api.delete(`/locations/${locationId}/geojson`);
      setGeojson(null);
      setLocation((prev) => ({ ...prev, hasGeojson: false }));
      setActionMsg('Batas GeoJSON berhasil dihapus.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setUploadError(e.message);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="DETAIL DATA MASTER"
        title={location ? location.name : 'Detail Lokasi / Blok'}
        description="Informasi blok kebun beserta batas geografis (GeoJSON) dan aksi pengelolaannya."
        action={
          <div className="detail-actions">
            <button type="button" className="btn btn-outline" onClick={onBack}>
              <ArrowLeft size={16} /> Kembali
            </button>
            {location && (
              <button type="button" className="btn btn-primary" onClick={() => onEdit(location)}>
                <Pencil size={15} /> Ubah Lokasi
              </button>
            )}
          </div>
        }
      />

      {loadError && <div className="alert">{loadError}</div>}

      {!location && loading && (
        <div className="panel detail-empty">Memuat detail lokasi...</div>
      )}

      {location && (
        <div className="detail-layout">
          <div className="panel detail-card">
            <div className="detail-card-head">
              <div>
                <span className="type-badge badge-green">
                  <MapPinned size={12} style={{ marginRight: 4 }} /> Blok Kebun
                </span>
                <h2>{location.name}</h2>
                <p>{location.description || 'Lokasi kebun tanpa keterangan tambahan.'}</p>
              </div>
              <div className="detail-total-box">
                <small>Catatan Panen</small>
                <b>{location.record_count || 0}</b>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <small>Nama Blok</small>
                <b>{location.name}</b>
              </div>
              <div className="detail-item">
                <small>Status Batas GeoJSON</small>
                <b>
                  {location.hasGeojson ? (
                    <span className="badge-available">
                      <CheckCircle2 size={12} /> Tersedia
                    </span>
                  ) : (
                    <span className="badge-unavailable">Belum ditambahkan</span>
                  )}
                </b>
              </div>
              <div className="detail-item">
                <small>Tipe Geometri</small>
                <b>{geojson ? geojson.type : '—'}</b>
              </div>
              <div className="detail-item">
                <small>Jumlah Titik Koordinat</small>
                <b>{geojson ? `${pointCount} titik` : '—'}</b>
              </div>
            </div>

            <div className="detail-map-section">
              <div className="map-panel-header">
                <div>
                  <h3>Peta Batas Blok</h3>
                  <p>Visualisasi polygon batas geografis WGS84.</p>
                </div>
                {geojson && (
                  <span className="badge-type">
                    <FileJson size={13} /> {geojson.type}
                  </span>
                )}
              </div>

              {loadingGeo && (
                <div className="map-placeholder">
                  <span>Memuat batas polygon GeoJSON...</span>
                </div>
              )}

              {!loadingGeo && errorGeo && (
                <div className="map-placeholder error">
                  <XCircle size={18} />
                  <span>{errorGeo}</span>
                </div>
              )}

              {!loadingGeo && !errorGeo && !location.hasGeojson && (
                <div className="map-placeholder empty">
                  <MapPinned size={32} />
                  <b>Batas geografis belum ditambahkan</b>
                  <span>
                    Unggah file GeoJSON (.geojson/.json) untuk menampilkan batas polygon blok ini.
                  </span>
                  <label className="btn btn-primary small-btn" style={{ marginTop: 12 }}>
                    <Upload size={14} /> Unggah GeoJSON
                    <input
                      type="file"
                      accept=".geojson,.json,application/geo+json,application/json"
                      style={{ display: 'none' }}
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              )}

              {!loadingGeo && !errorGeo && geojson && (
                <div className="map-wrapper">
                  <GeoJsonPreview geometry={geojson} height={360} />
                </div>
              )}
            </div>
          </div>

          <div className="panel detail-side-card">
            <h3>Aksi Batas Geografis</h3>

            <div className="action-button-group">
              <label className="btn btn-outline small-action-btn">
                <Upload size={14} /> {location.hasGeojson ? 'Ganti GeoJSON' : 'Unggah GeoJSON'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".geojson,.json,application/geo+json,application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>

              {location.hasGeojson && (
                <>
                  <button
                    className="btn btn-outline small-action-btn"
                    type="button"
                    onClick={exportGeoJson}
                  >
                    <Download size={14} /> Ekspor GeoJSON
                  </button>
                  <button
                    className="btn btn-danger-outline small-action-btn"
                    type="button"
                    onClick={deleteGeoJson}
                  >
                    <Trash2 size={14} /> Hapus Batas
                  </button>
                </>
              )}
            </div>

            {actionMsg && (
              <div className="geojson-validation success" style={{ marginTop: 12 }}>
                <CheckCircle2 size={14} /> {actionMsg}
              </div>
            )}
            {uploadError && (
              <div className="geojson-validation error" style={{ marginTop: 12 }}>
                <XCircle size={14} /> {uploadError}
              </div>
            )}

            <div className="detail-timestamps">
              <div>
                <small>ID Lokasi</small>
                <span>#{location.id}</span>
              </div>
              <div>
                <small>Status Batas</small>
                <span>{location.hasGeojson ? 'GeoJSON tersedia' : 'Belum ada GeoJSON'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
