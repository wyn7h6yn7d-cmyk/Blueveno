/** Avoid NaN / Infinity leaking into UI. */
export function safeNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return value;
}

export function safePercent(value: number | null | undefined): string {
  const n = safeNumber(value);
  if (n === null) return "—";
  return `${Math.round(n)}%`;
}
