import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { today } from '../utils/formatters.js';

const initialFilters = {
  search: '',
  startDate: '',
  endDate: '',
  locationId: '',
  maintenanceType: '',
  harvesterId: '',
  sort: 'newest',
};

const initialMonthRange = {
  startDate: `${today.slice(0, 7)}-01`,
  endDate: today,
};

export default function useMaintenanceData() {
  const [summary, setSummary] = useState(null);
  const [summaryRange, setSummaryRange] = useState(initialMonthRange);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    ...initialMonthRange,
    locationId: '',
    maintenanceType: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(summaryRange).filter(([, v]) => v));
    const query = new URLSearchParams(params);
    setSummary(await api.get(`/maintenance-records/summary${query.size ? `?${query}` : ''}`));
  }, [summaryRange]);

  const loadRecords = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const query = new URLSearchParams(params);
    setRecords(await api.get(`/maintenance-records${query.size ? `?${query}` : ''}`));
  }, [filters]);

  const loadReport = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(reportFilters).filter(([, v]) => v));
    const query = new URLSearchParams(params);
    setReport(await api.get(`/reports/maintenance${query.size ? `?${query}` : ''}`));
  }, [reportFilters]);

  const refreshMaintenance = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      await Promise.all([loadSummary(), loadRecords(), loadReport()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [loadSummary, loadRecords, loadReport]);

  useEffect(() => {
    loadSummary().catch((e) => setError(e.message));
  }, [loadSummary]);

  useEffect(() => {
    loadRecords().catch((e) => setError(e.message));
  }, [loadRecords]);

  useEffect(() => {
    loadReport().catch((e) => setError(e.message));
  }, [loadReport]);

  return {
    summary,
    summaryRange,
    setSummaryRange,
    records,
    filters,
    setFilters,
    report,
    reportFilters,
    setReportFilters,
    busy,
    error,
    setError,
    refreshMaintenance,
  };
}
