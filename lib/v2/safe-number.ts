/** Coerce unknown values to finite numbers — never NaN/Infinity in UI. */
export function safeFiniteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

/** Format a number for display, or em dash when invalid. */
export function safeDisplayNumber(value: unknown, fallback = "—"): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return String(n);
}

/** Clamp to 0–100 for progress and gauge visuals. */
export function clampPercent(value: unknown): number {
  const n = safeFiniteNumber(value, 0);
  return Math.min(100, Math.max(0, n));
}

/** Safe ratio for progress bars (value / goal). */
export function safeProgressRatio(value: unknown, goal: unknown): number {
  const v = safeFiniteNumber(value, 0);
  const g = Math.max(safeFiniteNumber(goal, 0), 1e-6);
  return clampPercent((v / g) * 100);
}
