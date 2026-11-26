export function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

export function optionalNonNegativeNumber(value) {
  if (value === undefined || value === null || value === '') return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
}

export function optionalNonNegativeInteger(value) {
  if (value === undefined || value === null || value === '') return true;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0;
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
