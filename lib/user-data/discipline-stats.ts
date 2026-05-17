import type { JournalRow } from "@/lib/user-data/types";

/** Per-entry discipline checks that were explicitly stored (non-null in DB). */
export function rowDisciplineChecks(row: JournalRow): { completed: number; total: number } {
  let completed = 0;
  let total = 0;
  if (row.followedPlan !== undefined) {
    total += 1;
    if (row.followedPlan) completed += 1;
  }
  if (row.respectedStop !== undefined) {
    total += 1;
    if (row.respectedStop) completed += 1;
  }
  if (row.noRevengeTrade !== undefined) {
    total += 1;
    if (row.noRevengeTrade) completed += 1;
  }
  return { completed, total };
}

export function rowHasRecordedDiscipline(row: JournalRow): boolean {
  return rowDisciplineChecks(row).total > 0;
}

/** Entry-weighted discipline %; null when no rows have recorded discipline checks. */
export function computeDisciplineScorePercent(entries: JournalRow[]): number | null {
  let completed = 0;
  let total = 0;
  for (const row of entries) {
    const checks = rowDisciplineChecks(row);
    if (checks.total === 0) continue;
    completed += checks.completed;
    total += checks.total;
  }
  if (total === 0) return null;
  const pct = (completed / total) * 100;
  return Number.isFinite(pct) ? Math.round(Math.max(0, Math.min(100, pct))) : null;
}

export function formatDisciplinePercent(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return "Not enough data";
  }
  return `${Math.round(score)}%`;
}

/** Per-entry score for a single row (0–100); null when no checks recorded. */
export function entryDisciplineScore(row: JournalRow): number | null {
  const { completed, total } = rowDisciplineChecks(row);
  if (total === 0) return null;
  const pct = (completed / total) * 100;
  return Number.isFinite(pct) ? Math.round(pct) : null;
}
