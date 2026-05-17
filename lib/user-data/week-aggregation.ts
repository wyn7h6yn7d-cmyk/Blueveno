export type WeekPnlRow = { weekStart: string; pnl: number };

export function pickBestWorstWeeks<T extends WeekPnlRow>(
  rows: T[],
): { bestWeek: T | null; weakestWeek: T | null } {
  if (rows.length === 0) return { bestWeek: null, weakestWeek: null };
  const bestWeek = rows.reduce((a, b) => (b.pnl > a.pnl ? b : a));
  if (rows.length === 1) return { bestWeek, weakestWeek: null };
  const weakestWeek = rows.reduce((a, b) => (b.pnl < a.pnl ? b : a));
  if (weakestWeek.weekStart === bestWeek.weekStart && weakestWeek.pnl === bestWeek.pnl) {
    return { bestWeek, weakestWeek: null };
  }
  return { bestWeek, weakestWeek };
}
