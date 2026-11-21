import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { today } from '../../utils/formatters.js';

export default function RecordModal({ initial, locations, harvesters, onClose, onSave }) {
  const [form, setForm] = useState({
    harvest_date: initial.harvest_date || today,
    location_id: initial.location_id || '',
    harvester_id: initial.harvester_id || '',
    bunch_count: initial.bunch_count || '',
    total_weight_kg: initial.total_weight_kg ?? '',
    notes: initial.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      location_id: Number(form.location_id),
      harvester_id: form.harvester_id ? Number(form.harvester_id) : null,
      bunch_count: Number(form.bunch_count),
      total_weight_kg: form.total_weight_kg === '' ? null : Number(form.total_weight_kg),
    });
    setSaving(false);
  };

  return (
    <Modal title={initial.id ? 'Ubah Catatan Panen' : 'Catat Hasil Panen'} onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        <label>
          Tanggal panen <span>*</span>
          <input
            type="date"
            name="harvest_date"
            value={form.harvest_date}
            onChange={update}
            required
          />
        </label>
        <label>
          Lokasi / blok <span>*</span>
          <select name="location_id" value={form.location_id} onChange={update} required>
            <option value="">Pilih lokasi</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Pemanen
          <select name="harvester_id" value={form.harvester_id} onChange={update}>
            <option value="">Pilih pemanen (opsional)</option>
            {harvesters
              .filter((h) => h.is_active)
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          Jumlah tandan <span>*</span>
          <input
            type="number"
            name="bunch_count"
            min="1"
            step="1"
            placeholder="Contoh: 85"
            value={form.bunch_count}
            onChange={update}
            required
          />
        </label>
        <label>
          Berat total (kg)
          <input
            type="number"
            name="total_weight_kg"
            min="0"
            step="0.01"
            placeholder="Opsional"
            value={form.total_weight_kg}
            onChange={update}
          />
        </label>
        <label className="full-field">
          Catatan
          <textarea
            name="notes"
            rows="3"
            placeholder="Tambahkan keterangan jika diperlukan..."
            value={form.notes}
            onChange={update}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
