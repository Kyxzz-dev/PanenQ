import { useState } from 'react';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import MobileNavbar from './components/layout/MobileNavbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import MasterPage from './pages/MasterPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import MaintenanceDashboardPage from './pages/MaintenanceDashboardPage.jsx';
import MaintenanceRecordsPage from './pages/MaintenanceRecordsPage.jsx';
import MaintenanceFormPage from './pages/MaintenanceFormPage.jsx';
import MaintenanceDetailPage from './pages/MaintenanceDetailPage.jsx';
import MaintenanceReportPage from './pages/MaintenanceReportPage.jsx';
import LocationDetailPage from './pages/LocationDetailPage.jsx';
import RecordModal from './components/records/RecordModal.jsx';
import MasterModal from './components/masters/MasterModal.jsx';
import useHarvestData from './hooks/useHarvestData.js';
import useMaintenanceData from './hooks/useMaintenanceData.js';
import useTheme from './hooks/useTheme.js';
import { api } from './services/api.js';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recordModal, setRecordModal] = useState(null);
  const [masterModal, setMasterModal] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [detailMaintenance, setDetailMaintenance] = useState(null);
  const [detailLocation, setDetailLocation] = useState(null);
  const [toast, setToast] = useState('');
  const { theme, toggleTheme } = useTheme();

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
    busy: harvestBusy,
    error: harvestError,
    setError: setHarvestError,
    refresh: refreshHarvest,
  } = useHarvestData();

  const {
    summary: maintenanceSummary,
    summaryRange: maintenanceSummaryRange,
    setSummaryRange: setMaintenanceSummaryRange,
    records: maintenanceRecords,
    filters: maintenanceFilters,
    setFilters: setMaintenanceFilters,
    report: maintenanceReport,
    reportFilters: maintenanceReportFilters,
    setReportFilters: setMaintenanceReportFilters,
    busy: maintenanceBusy,
    error: maintenanceError,
    setError: setMaintenanceError,
    refreshMaintenance,
  } = useMaintenanceData();

  const busy = harvestBusy || maintenanceBusy;
  const error = harvestError || maintenanceError;

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const refreshAll = async () => {
    await Promise.all([refreshHarvest(), refreshMaintenance()]);
  };

  const changePage = (id) => {
    if (id === 'maintenance-form') {
      setEditingMaintenance(null);
    }
    setPage(id);
    setMobileOpen(false);
    setHarvestError('');
    setMaintenanceError('');
  };

  const openMaintenanceCreate = () => {
    setEditingMaintenance(null);
    setPage('maintenance-form');
    setMobileOpen(false);
  };

  const openMaintenanceEdit = (record) => {
    setEditingMaintenance(record);
    setPage('maintenance-form');
    setMobileOpen(false);
  };

  const openMaintenanceDetail = (record) => {
    setDetailMaintenance(record);
    setPage('maintenance-detail');
    setMobileOpen(false);
  };

  const openLocationDetail = (location) => {
    setDetailLocation(location);
    setPage('location-detail');
    setMobileOpen(false);
  };

  const filterMaintenanceByType = (type) => {
    setMaintenanceFilters((prev) => ({ ...prev, maintenanceType: type }));
    setPage('maintenance-records');
    setMobileOpen(false);
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
      await refreshHarvest();
    } catch (e) {
      notify(e.message);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm('Hapus catatan panen ini?')) return;
    try {
      await api.delete(`/harvest-records/${id}`);
      notify('Catatan berhasil dihapus.');
      await refreshHarvest();
    } catch (e) {
      notify(e.message);
    }
  }

  async function saveMaintenance(payload, id) {
    try {
      const response = id
        ? await api.put(`/maintenance-records/${id}`, payload)
        : await api.post('/maintenance-records', payload);
      notify(response.message || 'Catatan perawatan berhasil disimpan.');
      setEditingMaintenance(null);
      if (response.data) {
        setDetailMaintenance(response.data);
      }
      await refreshMaintenance();
      setPage(response.data ? 'maintenance-detail' : 'maintenance-records');
      return true;
    } catch (e) {
      notify(e.message);
      return false;
    }
  }

  async function deleteMaintenance(id) {
    if (!window.confirm('Hapus catatan perawatan ini?')) return;
    try {
      const response = await api.delete(`/maintenance-records/${id}`);
      notify(response.message || 'Catatan perawatan berhasil dihapus.');
      if (detailMaintenance?.id === id) {
        setDetailMaintenance(null);
        setPage('maintenance-records');
      }
      await refreshMaintenance();
    } catch (e) {
      notify(e.message);
    }
  }

  async function saveMaster(payload) {
    const { type, id, geojson, ...body } = payload;
    const endpoint = type === 'location' ? '/locations' : '/harvesters';
    try {
      let savedId = id;
      if (id) {
        await api.put(`${endpoint}/${id}`, body);
      } else {
        const created = await api.post(endpoint, body);
        savedId = created?.id;
      }

      if (type === 'location' && geojson !== undefined && savedId) {
        if (geojson === null) {
          await api.delete(`/locations/${savedId}/geojson`).catch((e) => {
            if (!/belum memiliki|tidak ditemukan/i.test(e.message)) throw e;
          });
        } else {
          await api.put(`/locations/${savedId}/geojson`, { geojson });
        }
      }

      setMasterModal(null);
      notify('Data berhasil disimpan.');
      await refreshAll();
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
      await refreshAll();
    } catch (e) {
      notify(e.message);
    }
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <Sidebar
        page={page}
        mobileOpen={mobileOpen}
        collapsed={sidebarCollapsed}
        isOnline={!error}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onNavigate={changePage}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <Topbar
          page={page}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobile={() => setMobileOpen(true)}
          onRefresh={refreshAll}
        />

        <div className="content">
          {error && (
            <div className="alert">
              <b>Koneksi API bermasalah:</b> {error}{' '}
              <span>Pastikan backend berjalan di port 4000.</span>
            </div>
          )}

          <div className="page-enter" key={page}>
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
                onDetailLocation={openLocationDetail}
              />
            )}

            {page === 'location-detail' && (
              <LocationDetailPage
                locationId={detailLocation?.id}
                initialLocation={detailLocation}
                onBack={() => setPage('locations')}
                onEdit={(loc) => setMasterModal({ type: 'location', ...loc })}
                onDeleted={async () => {
                  setPage('locations');
                  await refreshAll();
                }}
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

            {page === 'profile' && (
              <div className="panel profile-panel">
                <div className="page-heading">
                  <div>
                    <span className="eyebrow">PENGATURAN AKUN</span>
                    <h2>Profil Pengguna</h2>
                    <p className="page-desc">Informasi akun lokal dan status aplikasi.</p>
                  </div>
                </div>
                <div className="profile-card" style={{ maxWidth: 520, marginTop: 20 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                    <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>A</div>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Administrator Kebun</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>admin@panenku.local</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 10, fontSize: 13, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Status Akun:</span>
                      <b>Aktif (Lokal / Standalone)</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tema Tampilan:</span>
                      <b>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Koneksi API:</span>
                      <b>{error ? 'Terputus' : 'Tersambung (Port 4000)'}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Versi Rilis:</span>
                      <b>v1.1 (Botanical Modern)</b>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {page === 'maintenance-dashboard' && (
              <MaintenanceDashboardPage
                summary={maintenanceSummary}
                range={maintenanceSummaryRange}
                setRange={setMaintenanceSummaryRange}
                onAdd={openMaintenanceCreate}
                onDetail={openMaintenanceDetail}
                onNavigate={changePage}
                onFilterByType={filterMaintenanceByType}
              />
            )}

            {page === 'maintenance-records' && (
              <MaintenanceRecordsPage
                records={maintenanceRecords}
                locations={locations}
                harvesters={harvesters}
                filters={maintenanceFilters}
                setFilters={setMaintenanceFilters}
                onAdd={openMaintenanceCreate}
                onDetail={openMaintenanceDetail}
                onEdit={openMaintenanceEdit}
                onDelete={deleteMaintenance}
              />
            )}

            {page === 'maintenance-form' && (
              <MaintenanceFormPage
                initial={editingMaintenance}
                locations={locations}
                harvesters={harvesters}
                onCancel={() => {
                  setEditingMaintenance(null);
                  setPage('maintenance-records');
                }}
                onSave={saveMaintenance}
              />
            )}

            {page === 'maintenance-detail' && (
              <MaintenanceDetailPage
                recordId={detailMaintenance?.id}
                initialRecord={detailMaintenance}
                onBack={() => setPage('maintenance-records')}
                onEdit={openMaintenanceEdit}
                onDelete={deleteMaintenance}
              />
            )}

            {page === 'maintenance-reports' && (
              <MaintenanceReportPage
                report={maintenanceReport}
                filters={maintenanceReportFilters}
                setFilters={setMaintenanceReportFilters}
                locations={locations}
                onDetail={openMaintenanceDetail}
              />
            )}
          </div>

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

        <MobileNavbar
          page={page}
          onNavigate={changePage}
        />

        {toast && <div className="toast">{toast}</div>}
        {busy && <div className="loading-line" />}
      </main>
    </div>
  );
}
