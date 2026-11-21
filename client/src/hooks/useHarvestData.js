import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { today } from '../utils/formatters.js';

const initialFilters = { startDate: '', endDate: '', locationId: '', harvesterId: '' };

export default function useHarvestData() {
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);
  const [locations, setLocations] = useState([]);
  const [harvesters, setHarvesters] = useState([]);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [reportRange, setReportRange] = useState({
    startDate: `${today.slice(0, 7)}-01`,
    endDate: today,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadMasters = useCallback(async () => {
    const [loc, harv] = await Promise.all([api.get('/locations'), api.get('/harvesters')]);
    setLocations(loc);
    setHarvesters(harv);
  }, []);

  const loadRecords = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const query = new URLSearchParams(params);
    setRecords(await api.get(`/harvest-records${query.size ? `?${query}` : ''}`));
  }, [filters]);

  const loadDashboard = useCallback(async () => {
    setDashboard(await api.get('/dashboard/summary'));
  }, []);

  const loadReport = useCallback(async () => {
    const query = new URLSearchParams(reportRange);
    setReport(await api.get(`/reports/summary?${query}`));
  }, [reportRange]);

  const refresh = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      await Promise.all([loadMasters(), loadRecords(), loadDashboard(), loadReport()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [loadMasters, loadRecords, loadDashboard, loadReport]);

  useEffect(() => {
    loadMasters().catch((e) => setError(e.message));
  }, [loadMasters]);

  useEffect(() => {
    loadDashboard().catch((e) => setError(e.message));
  }, [loadDashboard]);

  useEffect(() => {
    loadRecords().catch((e) => setError(e.message));
  }, [loadRecords]);

  useEffect(() => {
    loadReport().catch((e) => setError(e.message));
  }, [loadReport]);

  return {
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
  };
}
