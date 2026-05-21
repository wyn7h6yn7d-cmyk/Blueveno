import { parsePnlAmount } from "@/lib/user-data/kpi";
import { computeSessionPnlBreakdown, type SessionPnlRow } from "@/lib/user-data/trading-stats";
import type { JournalRow } from "@/lib/user-data/types";

export type SessionTagPerformanceRow = {
  label: string;
  totalPnl: number;
  averagePnl: number | null;
  entries: number;
  winRate: number | null;
};

export type SessionAnalysisHighlight = {
  label: string;
  totalPnl: number;
  entries: number;
} | null;

export type SessionAnalysis = {
  marketSessions: SessionPnlRow[];
  taggedSessions: SessionTagPerformanceRow[];
  bestMarketSession: SessionAnalysisHighlight;
  weakestMarketSession: SessionAnalysisHighlight;
  bestTaggedSession: SessionAnalysisHighlight;
  weakestTaggedSession: SessionAnalysisHighlight;
};

export function computeSessionTagPerformance(
  entries: JournalRow[],
  minEntries = 2,
): SessionTagPerformanceRow[] {
  const map = new Map<string, { sum: number; count: number; wins: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const label = row.sessionTag?.trim();
    if (!label || label === "Other" || label === "—") continue;
    const prev = map.get(label) ?? { sum: 0, count: 0, wins: 0 };
    map.set(label, {
      sum: prev.sum + pnl,
      count: prev.count + 1,
      wins: prev.wins + (pnl > 0 ? 1 : 0),
    });
  }
  return [...map.entries()]
    .filter(([, v]) => v.count >= minEntries)
    .map(([label, v]) => ({
      label,
      totalPnl: v.sum,
      averagePnl: v.count > 0 ? v.sum / v.count : null,
      entries: v.count,
      winRate: v.count > 0 ? Math.round((v.wins / v.count) * 100) : null,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

function pickHighlight<T extends { totalPnl: number; entries: number; label?: string; session?: string }>(
  rows: T[],
  pick: "best" | "worst",
): SessionAnalysisHighlight {
  const eligible = rows.filter((r) => r.entries > 0);
  if (eligible.length === 0) return null;
  const row = eligible.reduce((acc, cur) =>
    pick === "best"
      ? cur.totalPnl > acc.totalPnl
        ? cur
        : acc
      : cur.totalPnl < acc.totalPnl
        ? cur
        : acc,
  );
  const label = "label" in row && row.label ? row.label : "session" in row ? row.session : "—";
  return { label: String(label), totalPnl: row.totalPnl, entries: row.entries };
}

export function getSessionAnalysis(
  entries: JournalRow[],
  options?: { minTagEntries?: number },
): SessionAnalysis {
  const marketSessions = computeSessionPnlBreakdown(entries);
  const taggedSessions = computeSessionTagPerformance(entries, options?.minTagEntries ?? 2);

  return {
    marketSessions,
    taggedSessions,
    bestMarketSession: pickHighlight(
      marketSessions.map((r) => ({ ...r, label: r.session })),
      "best",
    ),
    weakestMarketSession: pickHighlight(
      marketSessions.map((r) => ({ ...r, label: r.session })),
      "worst",
    ),
    bestTaggedSession: pickHighlight(taggedSessions, "best"),
    weakestTaggedSession: pickHighlight(taggedSessions, "worst"),
  };
}
