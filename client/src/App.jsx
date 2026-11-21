import { useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import MasterPage from './pages/MasterPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import RecordModal from './components/records/RecordModal.jsx';
import MasterModal from './components/masters/MasterModal.jsx';
import useHarvestData from './hooks/useHarvestData.js';
import { api } from './services/api.js';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recordModal, setRecordModal] = useState(null);
  const [masterModal, setMasterModal] = useState(null);
  const [toast, setToast] = useState('');

  const {
    dashboard,
    records,
    locations,
    harvesters,
    report,
    filters,
    setFilters,
    reportRange,
    setReportRange,
    busy,
    error,
    setError,
    refresh,
  } = useHarvestData();

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const changePage = (id) => {
    setPage(id);
    setMobileOpen(false);
    setError('');
  };

  async function saveRecord(payload) {
    try {
      if (recordModal?.id) {
        await api.put(`/harvest-records/${recordModal.id}`, payload);
      } else {
        await api.post('/harvest-records', payload);
      }
      setRecordModal(null);
      notify('Catatan panen berhasil disimpan.');
      await refresh();
    } catch (e) {
      notify(e.message);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm('Hapus catatan panen ini?')) return;
    try {
      await api.delete(`/harvest-records/${id}`);
      notify('Catatan berhasil dihapus.');
      await refresh();
    } catch (e) {
      notify(e.message);
    }
  }

  async function saveMaster(payload) {
    const { type, id, ...body } = payload;
    const endpoint = type === 'location' ? '/locations' : '/harvesters';
    try {
      if (id) {
        await api.put(`${endpoint}/${id}`, body);
      } else {
        await api.post(endpoint, body);
      }
      setMasterModal(null);
      notify('Data berhasil disimpan.');
      await refresh();
    } catch (e) {
      notify(e.message);
    }
  }

  async function deleteMaster(type, id) {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    const endpoint = type === 'location' ? '/locations' : '/harvesters';
    try {
      await api.delete(`${endpoint}/${id}`);
      notify('Data berhasil dihapus.');
      await refresh();
    } catch (e) {
      notify(e.message);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        mobileOpen={mobileOpen}
        isOnline={!error}
        onNavigate={changePage}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <Topbar
          page={page}
          onOpenMobile={() => setMobileOpen(true)}
          onRefresh={refresh}
        />

        <div className="content">
          {error && (
            <div className="alert">
              <b>Koneksi API bermasalah:</b> {error}{' '}
              <span>Pastikan backend berjalan di port 4000.</span>
            </div>
          )}

          {page === 'dashboard' && (
            <DashboardPage
              data={dashboard}
              onAdd={() => setRecordModal({})}
              onNavigate={changePage}
            />
          )}

          {page === 'records' && (
            <RecordsPage
              records={records}
              locations={locations}
              harvesters={harvesters}
              filters={filters}
              setFilters={setFilters}
              onAdd={() => setRecordModal({})}
              onEdit={(r) => setRecordModal(r)}
              onDelete={deleteRecord}
            />
          )}

          {page === 'locations' && (
            <MasterPage
              type="location"
              rows={locations}
              onAdd={() => setMasterModal({ type: 'location' })}
              onEdit={(r) => setMasterModal({ type: 'location', ...r })}
              onDelete={(id) => deleteMaster('location', id)}
            />
          )}

          {page === 'harvesters' && (
            <MasterPage
              type="harvester"
              rows={harvesters}
              onAdd={() => setMasterModal({ type: 'harvester' })}
              onEdit={(r) => setMasterModal({ type: 'harvester', ...r })}
              onDelete={(id) => deleteMaster('harvester', id)}
            />
          )}

          {page === 'reports' && (
            <ReportsPage
              report={report}
              range={reportRange}
              setRange={setReportRange}
            />
          )}

          {recordModal && (
            <RecordModal
              initial={recordModal}
              locations={locations}
              harvesters={harvesters}
              onClose={() => setRecordModal(null)}
              onSave={saveRecord}
            />
          )}

          {masterModal && (
            <MasterModal
              initial={masterModal}
              onClose={() => setMasterModal(null)}
              onSave={saveMaster}
            />
          )}
        </div>

        {toast && <div className="toast">{toast}</div>}
        {busy && <div className="loading-line" />}
      </main>
    </div>
  );
}
