import { useState } from 'react';
import Modal from '../common/Modal.jsx';

export default function MasterModal({ initial, onClose, onSave }) {
  const isLocation = initial.type === 'location';
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [code, setCode] = useState(initial.employee_code || '');
  const [active, setActive] = useState(initial.is_active !== 0);

  const submit = (e) => {
    e.preventDefault();
    onSave({
      type: initial.type,
      id: initial.id,
      name,
      ...(isLocation ? { description } : { employee_code: code, is_active: active }),
    });
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
          <label className="full-field">
            Keterangan
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan lokasi (opsional)"
            />
          </label>
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
