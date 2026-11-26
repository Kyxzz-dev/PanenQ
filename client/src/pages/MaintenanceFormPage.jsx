import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeading from '../components/common/PageHeading.jsx';
import {
  MAINTENANCE_TYPE_META,
  formatCurrency,
  today,
} from '../utils/formatters.js';

function buildInitialState(initial) {
  return {
    maintenanceDate: initial?.maintenanceDate || today,
    locationId: initial?.locationId ? String(initial.locationId) : '',
    harvesterId: initial?.harvesterId ? String(initial.harvesterId) : '',
    maintenanceType: initial?.maintenanceType || 'pemupukan',
    materialCategory: initial?.materialCategory || 'Herbisida',
    materialName: initial?.materialName || '',
    workType: initial?.workType || 'Pemangkasan pelepah',
    dosage: initial?.dosage ?? '',
    dosageUnit:
      initial?.dosageUnit ||
      (initial?.maintenanceType === 'penyemprotan' ? 'liter/ha' : 'kg/pohon'),
    quantity: initial?.quantity ?? '',
    quantityUnit:
      initial?.quantityUnit ||
      (initial?.maintenanceType === 'penyemprotan' ? 'liter' : 'kg'),
    area: initial?.area ?? '',
    areaUnit: initial?.areaUnit || 'hektare',
    treeCount: initial?.treeCount ?? '',
    materialCost: initial?.materialCost ?? '',
    laborCost: initial?.laborCost ?? '',
    notes: initial?.notes || '',
  };
}

export default function MaintenanceFormPage({
  initial,
  locations,
  harvesters,
  onCancel,
  onSave,
}) {
  const isEditing = Boolean(initial?.id);
  const [form, setForm] = useState(() => buildInitialState(initial));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(buildInitialState(initial));
    setFormError('');
  }, [initial]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (nextType) => {
    setForm((prev) => ({
      ...prev,
      maintenanceType: nextType,
      dosageUnit:
        nextType === 'penyemprotan'
          ? prev.dosageUnit === 'kg/pohon'
            ? 'liter/ha'
            : prev.dosageUnit
          : prev.dosageUnit === 'liter/ha'
            ? 'kg/pohon'
            : prev.dosageUnit,
      quantityUnit:
        nextType === 'penyemprotan'
          ? prev.quantityUnit === 'kg'
            ? 'liter'
            : prev.quantityUnit
          : prev.quantityUnit === 'liter'
            ? 'kg'
            : prev.quantityUnit,
      workType: prev.workType || 'Pemangkasan pelepah',
      materialCategory: prev.materialCategory || 'Herbisida',
    }));
  };

  const materialCostNum =
    form.maintenanceType === 'pruning' ? 0 : Number(form.materialCost || 0);
  const laborCostNum = Number(form.laborCost || 0);
  const previewTotalCost =
    (Number.isFinite(materialCostNum) ? materialCostNum : 0) +
    (Number.isFinite(laborCostNum) ? laborCostNum : 0);

  const visibleHarvesters = harvesters.filter(
    (h) => h.is_active || String(h.id) === String(form.harvesterId)
  );

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.maintenanceDate) {
      setFormError('Tanggal perawatan wajib diisi.');
      return;
    }
    if (!form.locationId) {
      setFormError('Blok kebun wajib dipilih.');
      return;
    }

    const numericChecks = [
      { label: 'Dosis', value: form.dosage },
      { label: 'Jumlah bahan', value: form.quantity },
      { label: 'Luas area', value: form.area },
      { label: 'Jumlah pohon', value: form.treeCount },
      { label: 'Biaya bahan', value: form.materialCost },
      { label: 'Biaya tenaga kerja', value: form.laborCost },
    ];
    for (const item of numericChecks) {
      if (item.value !== '' && item.value !== null && Number(item.value) < 0) {
        setFormError(`${item.label} harus bernilai nol atau positif.`);
        return;
      }
    }

    const payload = {
      locationId: Number(form.locationId),
      maintenanceType: form.maintenanceType,
      maintenanceDate: form.maintenanceDate,
      laborCost: form.laborCost === '' ? 0 : Number(form.laborCost),
    };

    if (form.harvesterId) {
      payload.harvesterId = Number(form.harvesterId);
    }
    if (form.notes.trim()) {
      payload.notes = form.notes.trim();
    }

    if (form.maintenanceType === 'pemupukan') {
      if (!form.materialName.trim()) {
        setFormError('Nama atau jenis pupuk wajib diisi.');
        return;
      }
      payload.materialName = form.materialName.trim();
      if (form.dosage !== '') {
        payload.dosage = Number(form.dosage);
        if (form.dosageUnit.trim()) payload.dosageUnit = form.dosageUnit.trim();
      }
      if (form.quantity !== '') {
        payload.quantity = Number(form.quantity);
        if (form.quantityUnit.trim()) payload.quantityUnit = form.quantityUnit.trim();
      }
      if (form.treeCount !== '') {
        payload.treeCount = Number(form.treeCount);
      }
      payload.materialCost = form.materialCost === '' ? 0 : Number(form.materialCost);
    } else if (form.maintenanceType === 'penyemprotan') {
      if (!form.materialName.trim()) {
        setFormError('Nama bahan atau produk semprot wajib diisi.');
        return;
      }
      if (form.materialCategory.trim()) {
        payload.materialCategory = form.materialCategory.trim();
      }
      payload.materialName = form.materialName.trim();
      if (form.dosage !== '') {
        payload.dosage = Number(form.dosage);
        if (form.dosageUnit.trim()) payload.dosageUnit = form.dosageUnit.trim();
      }
      if (form.quantity !== '') {
        payload.quantity = Number(form.quantity);
        if (form.quantityUnit.trim()) payload.quantityUnit = form.quantityUnit.trim();
      }
      if (form.area !== '') {
        payload.area = Number(form.area);
        if (form.areaUnit.trim()) payload.areaUnit = form.areaUnit.trim();
      }
      payload.materialCost = form.materialCost === '' ? 0 : Number(form.materialCost);
    } else if (form.maintenanceType === 'pruning') {
      if (!form.workType.trim()) {
        setFormError('Jenis pekerjaan pruning wajib diisi.');
        return;
      }
      payload.workType = form.workType.trim();
      if (form.treeCount !== '') {
        payload.treeCount = Number(form.treeCount);
      }
      if (form.area !== '') {
        payload.area = Number(form.area);
        if (form.areaUnit.trim()) payload.areaUnit = form.areaUnit.trim();
      }
    }

    setSaving(true);
    const ok = await onSave(payload, initial?.id);
    setSaving(false);
    if (!ok) return;
  };

  return (
    <>
      <PageHeading
        eyebrow="PERAWATAN KEBUN"
        title={isEditing ? 'Ubah Catatan Perawatan' : 'Tambah Perawatan Kebun'}
        description="Catat aktivitas perawatan untuk satu blok kebun per pencatatan."
        action={
          <button className="btn btn-outline" onClick={onCancel} type="button">
            <ArrowLeft size={16} /> Kembali
          </button>
        }
      />

      <div className="panel form-page-panel">
        <form onSubmit={submit} className="maintenance-form">
          {formError && <div className="alert">{formError}</div>}

          <div className="form-section">
            <div className="form-section-head">
              <h3>1. Informasi Dasar</h3>
              <p>Setiap catatan perawatan hanya berlaku untuk satu blok kebun.</p>
            </div>

            <div className="type-selector-grid">
              {Object.entries(MAINTENANCE_TYPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  className={`type-option ${form.maintenanceType === key ? 'active' : ''}`}
                  onClick={() => handleTypeChange(key)}
                >
                  <span className={`type-badge ${meta.badgeClass}`}>{meta.label}</span>
                  <small>{meta.description}</small>
                </button>
              ))}
            </div>

            <div className="form-grid">
              <label>
                Tanggal perawatan <span>*</span>
                <input
                  type="date"
                  value={form.maintenanceDate}
                  onChange={(e) => updateField('maintenanceDate', e.target.value)}
                  required
                />
              </label>

              <label>
                Blok kebun <span>*</span>
                <select
                  value={form.locationId}
                  onChange={(e) => updateField('locationId', e.target.value)}
                  required
                >
                  <option value="">Pilih blok kebun</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Pekerja (opsional)
                <select
                  value={form.harvesterId}
                  onChange={(e) => updateField('harvesterId', e.target.value)}
                >
                  <option value="">Pilih pekerja (opsional)</option>
                  {visibleHarvesters.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                      {!h.is_active ? ' (Nonaktif)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-head">
              <h3>
                2. Detail {MAINTENANCE_TYPE_META[form.maintenanceType]?.label}
              </h3>
              <p>Kolom di bawah menyesuaikan jenis perawatan yang dipilih.</p>
            </div>

            {form.maintenanceType === 'pemupukan' && (
              <div className="form-grid">
                <label className="full-field">
                  Nama atau jenis pupuk <span>*</span>
                  <input
                    type="text"
                    placeholder="Contoh: NPK, Urea, Dolomit"
                    value={form.materialName}
                    onChange={(e) => updateField('materialName', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Dosis pupuk
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Contoh: 2"
                    value={form.dosage}
                    onChange={(e) => updateField('dosage', e.target.value)}
                  />
                </label>
                <label>
                  Satuan dosis
                  <input
                    type="text"
                    placeholder="Contoh: kg/pohon"
                    value={form.dosageUnit}
                    onChange={(e) => updateField('dosageUnit', e.target.value)}
                  />
                </label>
                <label>
                  Jumlah pupuk digunakan
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Contoh: 300"
                    value={form.quantity}
                    onChange={(e) => updateField('quantity', e.target.value)}
                  />
                </label>
                <label>
                  Satuan penggunaan pupuk
                  <input
                    type="text"
                    placeholder="Contoh: kg, karung"
                    value={form.quantityUnit}
                    onChange={(e) => updateField('quantityUnit', e.target.value)}
                  />
                </label>
                <label>
                  Jumlah pohon dipupuk
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Contoh: 150"
                    value={form.treeCount}
                    onChange={(e) => updateField('treeCount', e.target.value)}
                  />
                </label>
              </div>
            )}

            {form.maintenanceType === 'penyemprotan' && (
              <div className="form-grid">
                <label>
                  Jenis bahan
                  <select
                    value={form.materialCategory}
                    onChange={(e) => updateField('materialCategory', e.target.value)}
                  >
                    <option value="Herbisida">Herbisida</option>
                    <option value="Insektisida">Insektisida</option>
                    <option value="Fungisida">Fungisida</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </label>
                <label>
                  Nama bahan atau produk <span>*</span>
                  <input
                    type="text"
                    placeholder="Contoh: Gramoxone, Roundup"
                    value={form.materialName}
                    onChange={(e) => updateField('materialName', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Dosis bahan
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Contoh: 2"
                    value={form.dosage}
                    onChange={(e) => updateField('dosage', e.target.value)}
                  />
                </label>
                <label>
                  Satuan dosis
                  <input
                    type="text"
                    placeholder="Contoh: liter/ha, ml/tangki"
                    value={form.dosageUnit}
                    onChange={(e) => updateField('dosageUnit', e.target.value)}
                  />
                </label>
                <label>
                  Jumlah bahan digunakan
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Contoh: 2"
                    value={form.quantity}
                    onChange={(e) => updateField('quantity', e.target.value)}
                  />
                </label>
                <label>
                  Satuan penggunaan bahan
                  <input
                    type="text"
                    placeholder="Contoh: liter, ml"
                    value={form.quantityUnit}
                    onChange={(e) => updateField('quantityUnit', e.target.value)}
                  />
                </label>
                <label>
                  Luas area disemprot
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Contoh: 1.5"
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                  />
                </label>
                <label>
                  Satuan luas area
                  <input
                    type="text"
                    placeholder="Contoh: hektare"
                    value={form.areaUnit}
                    onChange={(e) => updateField('areaUnit', e.target.value)}
                  />
                </label>
              </div>
            )}

            {form.maintenanceType === 'pruning' && (
              <div className="form-grid">
                <label>
                  Jenis pekerjaan <span>*</span>
                  <input
                    type="text"
                    placeholder="Contoh: Pemangkasan pelepah"
                    value={form.workType}
                    onChange={(e) => updateField('workType', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Jumlah pohon dipangkas
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Contoh: 120"
                    value={form.treeCount}
                    onChange={(e) => updateField('treeCount', e.target.value)}
                  />
                </label>
                <label>
                  Luas area dikerjakan (opsional)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Opsional"
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                  />
                </label>
                <label>
                  Satuan luas area
                  <input
                    type="text"
                    placeholder="Contoh: hektare"
                    value={form.areaUnit}
                    onChange={(e) => updateField('areaUnit', e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-head">
              <h3>3. Biaya & Catatan</h3>
              <p>Total biaya dihitung dan divalidasi oleh server saat penyimpanan.</p>
            </div>

            <div className="form-grid">
              {form.maintenanceType !== 'pruning' && (
                <label>
                  {form.maintenanceType === 'pemupukan' ? 'Biaya pupuk (Rp)' : 'Biaya bahan (Rp)'}
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={form.materialCost}
                    onChange={(e) => updateField('materialCost', e.target.value)}
                  />
                </label>
              )}
              <label>
                Biaya tenaga kerja (Rp)
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  value={form.laborCost}
                  onChange={(e) => updateField('laborCost', e.target.value)}
                />
              </label>

              <div className="full-field cost-preview-bar">
                <span>Estimasi total biaya perawatan</span>
                <b>{formatCurrency(previewTotalCost)}</b>
              </div>

              <label className="full-field">
                Catatan tambahan
                <textarea
                  rows="3"
                  placeholder="Tambahkan keterangan pelaksanaan di blok kebun..."
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="form-page-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Perawatan'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
