import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileJson, MapPinned, X, XCircle } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import GeoJsonPreview from './GeoJsonPreview.jsx';

const MAX_FILE_BYTES = 1024 * 1024; // 1 MB

function extractGeometry(parsed) {
  if (parsed.type === 'Polygon' || parsed.type === 'MultiPolygon') return parsed;
  if (parsed.type === 'Feature') return parsed.geometry || null;
  if (parsed.type === 'FeatureCollection') {
    if (!Array.isArray(parsed.features) || parsed.features.length !== 1) return null;
    return parsed.features[0]?.geometry || null;
  }
  return null;
}

export default function MasterModal({ initial, onClose, onSave }) {
  const isLocation = initial.type === 'location';
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [code, setCode] = useState(initial.employee_code || '');
  const [active, setActive] = useState(initial.is_active !== 0);

  const [geoFile, setGeoFile] = useState(null);
  const [geoGeometry, setGeoGeometry] = useState(null);
  const [geoStatus, setGeoStatus] = useState('');
  const [geoError, setGeoError] = useState('');
  const [geoChanged, setGeoChanged] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLocation || !initial.id || !initial.hasGeojson) return;
    // Existing GeoJSON stays on server unless user replaces/removes it; preview loaded on detail page.
    setGeoStatus('Batas GeoJSON sudah tersimpan pada lokasi ini.');
  }, [isLocation, initial.id, initial.hasGeojson]);

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  async function handleGeoFile(file) {
    setGeoFile(null);
    setGeoGeometry(null);
    setGeoError('');
    setGeoStatus('');
    setGeoChanged(false);

    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.geojson') && !lowerName.endsWith('.json')) {
      setGeoError('File harus memiliki ekstensi .geojson atau .json.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setGeoError(`Ukuran file ${formatBytes(file.size)} melebihi batas 1 MB.`);
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const geometry = extractGeometry(parsed);
      if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
        setGeoError('Geometri harus Polygon atau MultiPolygon (Feature / FeatureCollection 1 fitur didukung).');
        return;
      }
      setGeoFile({ name: file.name, size: file.size });
      setGeoGeometry(geometry);
      setGeoStatus('File valid. Pratinjau polygon siap ditampilkan.');
      setGeoChanged(true);
    } catch {
      setGeoError('File bukan JSON yang valid.');
    }
  }

  function removeGeoFile() {
    setGeoFile(null);
    setGeoGeometry(null);
    setGeoStatus('');
    setGeoError('');
    setGeoChanged(Boolean(initial.id && initial.hasGeojson));
    if (inputRef.current) inputRef.current.value = '';
  }

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      type: initial.type,
      id: initial.id,
      name,
      ...(isLocation ? { description } : { employee_code: code, is_active: active }),
    };
    if (isLocation && geoChanged) {
      payload.geojson = geoGeometry; // null = hapus batas GeoJSON pada backend
    }
    onSave(payload);
  };

  return (
    <Modal
      title={`${initial.id ? 'Ubah' : 'Tambah'} ${isLocation ? 'Lokasi' : 'Pemanen'}`}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={submit}>
        <label className="full-field">
          {isLocation ? 'Nama lokasi / blok' : 'Nama pemanen'} <span>*</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={isLocation ? 'Contoh: Blok A-01' : 'Nama lengkap pemanen'}
          />
        </label>
        {isLocation ? (
          <>
            <label className="full-field">
              Keterangan
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Keterangan lokasi (opsional)"
              />
            </label>

            <div className="full-field geojson-field">
              <div className="geojson-field-title">
                <MapPinned size={15} /> Batas Blok (GeoJSON) — opsional
              </div>

              {initial.id && initial.hasGeojson && !geoChanged && (
                <div className="geojson-note">
                  <CheckCircle2 size={15} /> Batas tersimpan. Pilih file baru untuk mengganti, atau hapus batas.
                </div>
              )}

              {!geoFile && (
                <label className="geojson-dropzone">
                  <FileJson size={22} />
                  <span>Pilih file .geojson / .json (maks. 1 MB)</span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".geojson,.json,application/geo+json,application/json"
                    onChange={(e) => handleGeoFile(e.target.files?.[0])}
                  />
                </label>
              )}

              {geoFile && (
                <div className="geojson-file-row">
                  <FileJson size={16} />
                  <div>
                    <b>{geoFile.name}</b>
                    <small>{formatBytes(geoFile.size)}</small>
                  </div>
                  <button type="button" className="icon-btn small" onClick={removeGeoFile} title="Lepaskan file">
                    <X size={15} />
                  </button>
                </div>
              )}

              {geoError && (
                <div className="geojson-validation error">
                  <XCircle size={15} /> {geoError}
                </div>
              )}
              {geoStatus && !geoError && (
                <div className="geojson-validation success">
                  <CheckCircle2 size={15} /> {geoStatus}
                </div>
              )}

              {geoGeometry && <GeoJsonPreview geometry={geoGeometry} />}
            </div>
          </>
        ) : (
          <>
            <label className="full-field">
              Kode pekerja
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nomor pekerja (opsional)"
              />
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />{' '}
              Pemanen aktif
            </label>
          </>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" type="submit">
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
}
