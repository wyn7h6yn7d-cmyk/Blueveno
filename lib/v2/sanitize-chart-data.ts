import { safeFiniteNumber } from "@/lib/v2/safe-number";

/** Sanitize numeric keys in chart rows so Recharts never receives NaN/Infinity. */
export function sanitizeChartRows<T extends Record<string, string | number>>(
  rows: T[],
  numericKeys: string[],
): T[] {
  return rows.map((row) => {
    const next = { ...row };
    for (const key of numericKeys) {
      if (key in next) {
        (next as Record<string, string | number>)[key] = safeFiniteNumber(next[key], 0);
      }
    }
    return next;
  });
}
