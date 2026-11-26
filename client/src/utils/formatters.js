export const today = new Date().toISOString().slice(0, 10);

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00`));
}

export function formatDateTime(value) {
  if (!value) return '-';
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const MAINTENANCE_TYPE_META = {
  pemupukan: {
    label: 'Pemupukan',
    badgeClass: 'badge-green',
    description: 'Pemberian pupuk pada blok kebun',
  },
  penyemprotan: {
    label: 'Penyemprotan',
    badgeClass: 'badge-orange',
    description: 'Aplikasi herbisida, insektisida, atau fungisida',
  },
  pruning: {
    label: 'Pruning',
    badgeClass: 'badge-blue',
    description: 'Pemangkasan dan sanitasi pelepah sawit',
  },
};

export function maintenanceTypeLabel(type) {
  return MAINTENANCE_TYPE_META[type]?.label || type || '-';
}

export function formatMaintenanceMaterial(record) {
  if (!record) return '-';
  if (record.maintenanceType === 'pruning') {
    return record.workType || 'Pemangkasan pelepah';
  }
  if (record.maintenanceType === 'penyemprotan' && record.materialCategory && record.materialName) {
    return `${record.materialCategory} · ${record.materialName}`;
  }
  return record.materialName || record.materialCategory || '-';
}

export function formatMaintenanceScope(record) {
  if (!record) return '-';
  const parts = [];
  if (record.quantity != null) {
    parts.push(`${formatNumber(record.quantity)}${record.quantityUnit ? ` ${record.quantityUnit}` : ''}`);
  }
  if (record.area != null) {
    parts.push(`${formatNumber(record.area)}${record.areaUnit ? ` ${record.areaUnit}` : ' ha'}`);
  }
  if (record.treeCount != null) {
    parts.push(`${formatNumber(record.treeCount)} pohon`);
  }
  return parts.length ? parts.join(' · ') : '-';
}
