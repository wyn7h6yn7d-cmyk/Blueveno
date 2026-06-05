import { rowDisciplineChecks } from "@/lib/user-data/discipline-stats";
import type { JournalRow } from "@/lib/user-data/types";

export function rowDisciplineScorePercent(row: JournalRow): number | null {
  const { completed, total } = rowDisciplineChecks(row);
  if (total === 0) return null;
  const pct = (completed / total) * 100;
  if (!Number.isFinite(pct)) return null;
  return Math.round(Math.max(0, Math.min(100, pct)));
}
