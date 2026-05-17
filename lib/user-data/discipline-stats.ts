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

export type DisciplineCoverage = {
  score: number | null;
  entriesTotal: number;
  entriesWithChecks: number;
  checksRecorded: number;
  checksPassed: number;
  checksFailed: number;
};

export function summarizeDisciplineCoverage(entries: JournalRow[]): DisciplineCoverage {
  let entriesWithChecks = 0;
  let checksRecorded = 0;
  let checksPassed = 0;
  for (const row of entries) {
    const checks = rowDisciplineChecks(row);
    if (checks.total === 0) continue;
    entriesWithChecks += 1;
    checksRecorded += checks.total;
    checksPassed += checks.completed;
  }
  return {
    score: computeDisciplineScorePercent(entries),
    entriesTotal: entries.length,
    entriesWithChecks,
    checksRecorded,
    checksPassed,
    checksFailed: checksRecorded - checksPassed,
  };
}

const MISSING_DISCIPLINE_COVERAGE_RATIO = 0.5;

export function getDisciplineCoverageHint(coverage: DisciplineCoverage): string | undefined {
  if (coverage.entriesTotal < 5) return undefined;
  if (coverage.checksRecorded === 0) return undefined;
  const missingEntries = coverage.entriesTotal - coverage.entriesWithChecks;
  if (missingEntries / coverage.entriesTotal >= MISSING_DISCIPLINE_COVERAGE_RATIO) {
    return "Most entries are missing discipline checks.";
  }
  return undefined;
}

export function formatDisciplinePercent(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return "Not enough discipline data";
  }
  return `${Math.round(score)}%`;
}

export type DisciplineDisplay = {
  value: string;
  hint?: string;
};

export function getDisciplineDisplay(coverage: DisciplineCoverage): DisciplineDisplay {
  if (coverage.checksRecorded === 0) {
    return {
      value: "Not enough discipline data",
      hint: "Log Followed plan, Respected stop, or No revenge in the journal Behavior section.",
    };
  }
  const hint = getDisciplineCoverageHint(coverage);
  return {
    value: formatDisciplinePercent(coverage.score),
    hint,
  };
}

/** Per-entry score for a single row (0–100); null when no checks recorded. */
export function entryDisciplineScore(row: JournalRow): number | null {
  const { completed, total } = rowDisciplineChecks(row);
  if (total === 0) return null;
  const pct = (completed / total) * 100;
  return Number.isFinite(pct) ? Math.round(pct) : null;
}
