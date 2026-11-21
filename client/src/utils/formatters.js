export const today = new Date().toISOString().slice(0, 10);

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00`));
}
