import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, ClipboardList, MapPinned, Users, ChartNoAxesCombined,
  Plus, Search, Download, Pencil, Trash2, Leaf, Menu, X, CalendarDays,
  Weight, Boxes, ArrowUpRight, RefreshCw, ChevronDown
} from 'lucide-react';
import { api } from './services/api';

const today = new Date().toISOString().slice(0, 10);
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'records', label: 'Catatan Panen', icon: ClipboardList },
  { id: 'locations', label: 'Lokasi / Blok', icon: MapPinned },
  { id: 'harvesters', label: 'Data Pemanen', icon: Users },
  { id: 'reports', label: 'Laporan', icon: ChartNoAxesCombined },
];

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(Number(value || 0));
}
function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00`));
}
function downloadCsv(rows) {
  const columns = ['Tanggal', 'Lokasi', 'Pemanen', 'Jumlah Tandan', 'Berat (kg)', 'Catatan'];
  const values = rows.map(r => [r.harvest_date, r.location_name, r.harvester_name || '',
    r.bunch_count, r.total_weight_kg ?? '', r.notes || '']);
  const csv = [columns, ...values].map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `laporan-panen-${today}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);
  const [locations, setLocations] = useState([]);
  const [harvesters, setHarvesters] = useState([]);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', locationId: '', harvesterId: '' });
  const [reportRange, setReportRange] = useState({ startDate: today.slice(0, 7) + '-01', endDate: today });
  const [recordModal, setRecordModal] = useState(null);
  const [masterModal, setMasterModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  const loadMasters = async () => {
    const [loc, harv] = await Promise.all([api.get('/locations'), api.get('/harvesters')]);
    setLocations(loc); setHarvesters(harv);
  };
  const loadRecords = async () => {
    const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    setRecords(await api.get(`/harvest-records${query.size ? `?${query}` : ''}`));
  };
  const loadDashboard = async () => setDashboard(await api.get('/dashboard/summary'));
  const loadReport = async () => {
    const query = new URLSearchParams(reportRange);
    setReport(await api.get(`/reports/summary?${query}`));
  };
  const refresh = async () => {
    setBusy(true); setError('');
    try { await Promise.all([loadMasters(), loadRecords(), loadDashboard(), loadReport()]); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (page === 'records') loadRecords().catch(e => setError(e.message)); }, [filters, page]);
  useEffect(() => { if (page === 'reports') loadReport().catch(e => setError(e.message)); }, [reportRange, page]);

  const totalBunches = useMemo(() => records.reduce((sum, r) => sum + Number(r.bunch_count), 0), [records]);
  const changePage = (id) => { setPage(id); setMobileOpen(false); setError(''); };

  async function saveRecord(payload) {
    try {
      if (recordModal?.id) await api.put(`/harvest-records/${recordModal.id}`, payload);
      else await api.post('/harvest-records', payload);
      setRecordModal(null); notify('Catatan panen berhasil disimpan.'); await refresh();
    } catch (e) { notify(e.message); }
  }
  async function deleteRecord(id) {
    if (!confirm('Hapus catatan panen ini?')) return;
    try { await api.delete(`/harvest-records/${id}`); notify('Catatan berhasil dihapus.'); await refresh(); }
    catch (e) { notify(e.message); }
  }
  async function saveMaster(payload) {
    const { type, id, ...body } = payload;
    const endpoint = type === 'location' ? '/locations' : '/harvesters';
    try {
      if (id) await api.put(`${endpoint}/${id}`, body);
      else await api.post(endpoint, body);
      setMasterModal(null); notify('Data berhasil disimpan.'); await refresh();
    } catch (e) { notify(e.message); }
  }
  async function deleteMaster(type, id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try { await api.delete(`/${type === 'location' ? 'locations' : 'harvesters'}/${id}`); notify('Data berhasil dihapus.'); await refresh(); }
    catch (e) { notify(e.message); }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Leaf size={21} /></div><div><b>PanenKu</b><small>HARVEST MANAGEMENT</small></div><button className="icon-btn mobile-close" onClick={() => setMobileOpen(false)}><X /></button></div>
      <div className="workspace-label">MENU UTAMA</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => changePage(item.id)}><item.icon size={18}/><span>{item.label}</span>{page === item.id && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-dot"/> <span>Database lokal aktif</span><span className="version">v1.0</span></div>
    </aside>
    {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu /></button>
        <div className="breadcrumb">Workspace <span>/</span> <b>{navItems.find(n => n.id === page)?.label}</b></div>
        <div className="top-actions"><span className="today-label"><CalendarDays size={15}/>{formatDate(today)}</span><button className="icon-btn" onClick={refresh} title="Muat ulang"><RefreshCw size={17}/></button><div className="avatar">A</div></div>
      </header>
      <div className="content">
        {error && <div className="alert"><b>Koneksi API bermasalah:</b> {error} <span>Pastikan backend berjalan di port 4000.</span></div>}
        {page === 'dashboard' && <Dashboard data={dashboard} onAdd={() => setRecordModal({})} onNavigate={changePage}/>}
        {page === 'records' && <Records records={records} locations={locations} harvesters={harvesters} filters={filters} setFilters={setFilters} onAdd={() => setRecordModal({})} onEdit={r => setRecordModal(r)} onDelete={deleteRecord}/>}
        {page === 'locations' && <MasterPage type="location" rows={locations} onAdd={() => setMasterModal({ type: 'location' })} onEdit={r => setMasterModal({ type: 'location', ...r })} onDelete={id => deleteMaster('location', id)}/>}
        {page === 'harvesters' && <MasterPage type="harvester" rows={harvesters} onAdd={() => setMasterModal({ type: 'harvester' })} onEdit={r => setMasterModal({ type: 'harvester', ...r })} onDelete={id => deleteMaster('harvester', id)}/>}
        {page === 'reports' && <Reports report={report} range={reportRange} setRange={setReportRange}/>}
        {recordModal && <RecordModal initial={recordModal} locations={locations} harvesters={harvesters} onClose={() => setRecordModal(null)} onSave={saveRecord}/>}
        {masterModal && <MasterModal initial={masterModal} onClose={() => setMasterModal(null)} onSave={saveMaster}/>}
      </div>
      {toast && <div className="toast">{toast}</div>}
      {busy && <div className="loading-line"/>}
    </main>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Dashboard({ data, onAdd, onNavigate }) {
  const todayData = data?.today || {};
  const all = data?.allTime || {};
  return <>
    <PageHeading eyebrow="RINGKASAN AKTIVITAS" title="Dashboard" description="Pantau hasil panen dan aktivitas pencatatan dalam satu tempat." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Catat Panen</button>}/>
    <div className="welcome-banner"><div><span className="banner-tag"><Leaf size={13}/> PANEN TERDATA, KERJA TERARAH</span><h2>Selamat datang di PanenKu</h2><p>Kelola pencatatan tandan hasil panen dengan lebih rapi dan mudah.</p></div><div className="banner-art"><div className="sun"/><div className="hill hill-one"/><div className="hill hill-two"/><Leaf className="banner-leaf" size={76}/></div></div>
    <div className="section-title"><div><h3>Ringkasan hari ini</h3><p>Akumulasi pencatatan pada tanggal {formatDate(today)}.</p></div></div>
    <div className="stats-grid">
      <StatCard icon={Boxes} label="Total tandan hari ini" value={formatNumber(todayData.total_bunches)} unit="tandan" tone="green" />
      <StatCard icon={Weight} label="Berat hari ini" value={formatNumber(todayData.total_weight_kg)} unit="kg" tone="orange" />
      <StatCard icon={ClipboardList} label="Transaksi hari ini" value={formatNumber(todayData.total_records)} unit="catatan" tone="blue" />
      <StatCard icon={ChartNoAxesCombined} label="Total tandan keseluruhan" value={formatNumber(all.total_bunches)} unit="tandan" tone="purple" />
    </div>
    <div className="section-title table-section-heading"><div><h3>Catatan terbaru</h3><p>Enam pencatatan terakhir yang masuk ke sistem.</p></div><button className="text-btn" onClick={() => onNavigate('records')}>Lihat semua <ArrowUpRight size={15}/></button></div>
    <div className="panel table-panel"><RecordTable rows={data?.recent || []} compact/></div>
  </>;
}
function StatCard({ icon: Icon, label, value, unit, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}<small>{unit}</small></div><div className="stat-foot"><span className="stat-indicator"/> Data tercatat</div></div>;
}
function Records({ records, locations, harvesters, filters, setFilters, onAdd, onEdit, onDelete }) {
  return <>
    <PageHeading eyebrow="PENGELOLAAN DATA" title="Catatan Panen" description="Tambah, cari, dan kelola seluruh pencatatan hasil panen." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Catat Panen</button>}/>
    <div className="filter-panel">
      <div className="search-field"><Search size={16}/><span>Filter data panen</span></div>
      <label>Dari tanggal<input type="date" value={filters.startDate} onChange={e => setFilters(p => ({...p, startDate:e.target.value}))}/></label>
      <label>Sampai tanggal<input type="date" value={filters.endDate} onChange={e => setFilters(p => ({...p, endDate:e.target.value}))}/></label>
      <label>Lokasi<select value={filters.locationId} onChange={e => setFilters(p => ({...p, locationId:e.target.value}))}><option value="">Semua lokasi</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
      <label>Pemanen<select value={filters.harvesterId} onChange={e => setFilters(p => ({...p, harvesterId:e.target.value}))}><option value="">Semua pemanen</option>{harvesters.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
      <button className="btn btn-outline export-btn" onClick={() => downloadCsv(records)}><Download size={16}/> Ekspor CSV</button>
    </div>
    <div className="list-summary"><span><b>{records.length}</b> catatan ditemukan</span><span>Total <b>{formatNumber(records.reduce((s,r)=>s+Number(r.bunch_count),0))}</b> tandan pada hasil filter</span></div>
    <div className="panel table-panel"><RecordTable rows={records} onEdit={onEdit} onDelete={onDelete}/></div>
  </>;
}
function RecordTable({ rows, onEdit, onDelete, compact=false }) {
  if (!rows?.length) return <div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><b>Belum ada catatan panen</b><span>Data pencatatan yang ditambahkan akan muncul di sini.</span></div>;
  return <div className="table-wrap"><table><thead><tr><th>TANGGAL</th><th>LOKASI / BLOK</th><th>PEMANEN</th><th>JUMLAH TANDAN</th><th>BERAT TOTAL</th>{!compact && <th>AKSI</th>}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><span className="date-cell">{formatDate(r.harvest_date)}</span></td><td><span className="location-cell"><MapPinned size={14}/>{r.location_name}</span></td><td>{r.harvester_name || <span className="muted">—</span>}</td><td><b>{formatNumber(r.bunch_count)}</b> <small className="muted">tandan</small></td><td>{r.total_weight_kg == null ? <span className="muted">—</span> : `${formatNumber(r.total_weight_kg)} kg`}</td>{!compact && <td><div className="row-actions"><button className="icon-btn small" title="Edit" onClick={()=>onEdit(r)}><Pencil size={15}/></button><button className="icon-btn small danger" title="Hapus" onClick={()=>onDelete(r.id)}><Trash2 size={15}/></button></div></td>}</tr>)}</tbody></table></div>;
}
function MasterPage({ type, rows, onAdd, onEdit, onDelete }) {
  const isLocation = type === 'location';
  return <>
    <PageHeading eyebrow="DATA MASTER" title={isLocation ? 'Lokasi / Blok' : 'Data Pemanen'} description={isLocation ? 'Kelola daftar lokasi atau blok kebun.' : 'Kelola daftar pekerja yang melakukan pemanenan.'} action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Tambah {isLocation ? 'Lokasi' : 'Pemanen'}</button>}/>
    <div className="master-grid">{rows.map(r=><div className="master-card" key={r.id}><div className="master-icon">{isLocation?<MapPinned size={20}/>:<Users size={20}/>}</div><div className="master-card-main"><b>{r.name}</b><span>{isLocation ? (r.description || 'Lokasi kebun') : (r.employee_code || 'Kode pekerja belum diisi')}</span></div><div className="master-card-count">{r.record_count || 0}<small>catatan</small></div><div className="row-actions"><button className="icon-btn small" onClick={()=>onEdit(r)}><Pencil size={15}/></button><button className="icon-btn small danger" onClick={()=>onDelete(r.id)}><Trash2 size={15}/></button></div></div>)}
      {!rows.length && <div className="panel empty-master"><div className="empty-icon"><Plus size={24}/></div><b>Belum ada data master</b><span>Tambahkan data pertama untuk mulai mencatat panen.</span><button className="btn btn-primary" onClick={onAdd}>Tambah data</button></div>}
    </div>
  </>;
}
function Reports({ report, range, setRange }) {
  const totals = report?.totals || {};
  return <>
    <PageHeading eyebrow="ANALISIS HASIL" title="Laporan Panen" description="Rekapitulasi hasil panen berdasarkan periode dan lokasi."/>
    <div className="filter-panel report-filter"><label>Dari tanggal<input type="date" value={range.startDate} onChange={e=>setRange(p=>({...p,startDate:e.target.value}))}/></label><label>Sampai tanggal<input type="date" value={range.endDate} onChange={e=>setRange(p=>({...p,endDate:e.target.value}))}/></label></div>
    <div className="stats-grid report-stats"><StatCard icon={Boxes} label="Total tandan" value={formatNumber(totals.total_bunches)} unit="tandan" tone="green"/><StatCard icon={Weight} label="Total berat" value={formatNumber(totals.total_weight_kg)} unit="kg" tone="orange"/><StatCard icon={ClipboardList} label="Jumlah transaksi" value={formatNumber(totals.total_records)} unit="catatan" tone="blue"/></div>
    <div className="section-title"><div><h3>Hasil panen per lokasi</h3><p>Perbandingan jumlah tandan pada periode terpilih.</p></div></div>
    <div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>LOKASI / BLOK</th><th>JUMLAH TRANSAKSI</th><th>TOTAL TANDAN</th><th>BERAT TOTAL</th></tr></thead><tbody>{(report?.byLocation || []).map(r=><tr key={r.id}><td><b>{r.name}</b></td><td>{formatNumber(r.total_records)}</td><td><b>{formatNumber(r.total_bunches)}</b> tandan</td><td>{formatNumber(r.total_weight_kg)} kg</td></tr>)}</tbody></table>{!report?.byLocation?.length && <div className="empty-state">Belum ada data pada periode ini.</div>}</div></div>
  </>;
}
function RecordModal({ initial, locations, harvesters, onClose, onSave }) {
  const [form, setForm] = useState({ harvest_date: initial.harvest_date || today, location_id: initial.location_id || '', harvester_id: initial.harvester_id || '', bunch_count: initial.bunch_count || '', total_weight_kg: initial.total_weight_kg ?? '', notes: initial.notes || '' });
  const [saving, setSaving] = useState(false);
  const update = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const submit = async e => { e.preventDefault(); setSaving(true); await onSave({...form, location_id:Number(form.location_id), harvester_id:form.harvester_id?Number(form.harvester_id):null, bunch_count:Number(form.bunch_count), total_weight_kg:form.total_weight_kg===''?null:Number(form.total_weight_kg)}); setSaving(false); };
  return <Modal title={initial.id?'Ubah Catatan Panen':'Catat Hasil Panen'} onClose={onClose}><form onSubmit={submit} className="form-grid">
    <label>Tanggal panen <span>*</span><input type="date" name="harvest_date" value={form.harvest_date} onChange={update} required/></label>
    <label>Lokasi / blok <span>*</span><select name="location_id" value={form.location_id} onChange={update} required><option value="">Pilih lokasi</option>{locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
    <label>Pemanen<select name="harvester_id" value={form.harvester_id} onChange={update}><option value="">Pilih pemanen (opsional)</option>{harvesters.filter(h=>h.is_active).map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
    <label>Jumlah tandan <span>*</span><input type="number" name="bunch_count" min="1" step="1" placeholder="Contoh: 85" value={form.bunch_count} onChange={update} required/></label>
    <label>Berat total (kg)<input type="number" name="total_weight_kg" min="0" step="0.01" placeholder="Opsional" value={form.total_weight_kg} onChange={update}/></label>
    <label className="full-field">Catatan<textarea name="notes" rows="3" placeholder="Tambahkan keterangan jika diperlukan..." value={form.notes} onChange={update}/></label>
    <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Batal</button><button className="btn btn-primary" disabled={saving}>{saving?'Menyimpan...':'Simpan Catatan'}</button></div>
  </form></Modal>;
}
function MasterModal({ initial, onClose, onSave }) {
  const isLocation = initial.type === 'location';
  const [name,setName]=useState(initial.name||'');
  const [description,setDescription]=useState(initial.description||'');
  const [code,setCode]=useState(initial.employee_code||'');
  const [active,setActive]=useState(initial.is_active !== 0);
  const submit=e=>{e.preventDefault();onSave({type:initial.type,id:initial.id,name,...(isLocation?{description}:{employee_code:code,is_active:active})});};
  return <Modal title={`${initial.id?'Ubah':'Tambah'} ${isLocation?'Lokasi':'Pemanen'}`} onClose={onClose}><form className="form-grid" onSubmit={submit}>
    <label className="full-field">{isLocation?'Nama lokasi / blok':'Nama pemanen'} <span>*</span><input value={name} onChange={e=>setName(e.target.value)} required placeholder={isLocation?'Contoh: Blok A-01':'Nama lengkap pemanen'}/></label>
    {isLocation?<label className="full-field">Keterangan<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Keterangan lokasi (opsional)"/></label>:<><label className="full-field">Kode pekerja<input value={code} onChange={e=>setCode(e.target.value)} placeholder="Nomor pekerja (opsional)"/></label><label className="checkbox-field"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/> Pemanen aktif</label></>}
    <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Batal</button><button className="btn btn-primary">Simpan</button></div>
  </form></Modal>;
}
function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal"><div className="modal-header"><div><div className="eyebrow">FORM DATA</div><h3>{title}</h3></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>{children}</div></div>;
}
