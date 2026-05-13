import type { JournalRow } from "@/lib/user-data/types";

/**
 * Parse journal P&L cell: plain number, optional R suffix (legacy), optional currency symbols.
 * Values are treated as monetary amounts in the user's chosen display currency.
 */
export function parsePnlAmount(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/[Rr]\s*$/u, "")
    .replace(/[$€£¥₹]/g, "")
    .replace(/−/g, "-")
    .replace(/\s+/g, "");
  if (!cleaned) return null;
  if (cleaned.includes(",") && cleaned.includes(".")) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(",", ".") : cleaned;
  if (!/^[+-]?\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Win rate from journal rows with parseable P&amp;L: winning / (winning + losing).
 * Breakeven (0) and non-numeric cells are excluded from the denominator.
 */
export function tradeWinRatePercent(rows: Iterable<{ r: string }>): number | null {
  let wins = 0;
  let losses = 0;
  for (const row of rows) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null) continue;
    if (pnl > 0) wins += 1;
    else if (pnl < 0) losses += 1;
  }
  const denom = wins + losses;
  return denom > 0 ? Math.round((wins / denom) * 100) : null;
}

/** @deprecated Use parsePnlAmount — kept for existing imports */
export function parseR(raw: string): number | null {
  return parsePnlAmount(raw);
}

export type KpiSnapshot = {
  netR: string;
  netRDelta: string;
  netRTone: "positive" | "negative" | "neutral";
  expectancy: string;
  expectancyDelta: string;
  expectancyTone: "positive" | "negative" | "neutral";
  winRate: string;
  winRateDelta: string;
  winRateTone: "positive" | "negative" | "neutral";
  maxDd: string;
  maxDdDelta: string;
  maxDdTone: "positive" | "negative" | "neutral";
};

const empty: KpiSnapshot = {
  netR: "—",
  netRDelta: "Add trades from the form below",
  netRTone: "neutral",
  expectancy: "—",
  expectancyDelta: "Per trade",
  expectancyTone: "neutral",
  winRate: "—",
  winRateDelta: "Winning vs total fills",
  winRateTone: "neutral",
  maxDd: "—",
  maxDdDelta: "From your P&L series",
  maxDdTone: "neutral",
};

function fmtSigned(n: number, digits = 1): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return `${sign}${abs.toFixed(digits)}`;
}

export function computeKpis(journal: JournalRow[]): KpiSnapshot {
  const chronological = [...journal].reverse();
  const rs = chronological.map((j) => parsePnlAmount(j.r)).filter((n): n is number => n !== null);
  if (rs.length === 0) return empty;

  const net = rs.reduce((a, b) => a + b, 0);
  const exp = net / rs.length;
  const wins = rs.filter((r) => r > 0).length;
  const losses = rs.filter((r) => r < 0).length;
  const directional = wins + losses;
  const winPct = directional > 0 ? Math.round((wins / directional) * 100) : 0;

  let cum = 0;
  let peak = 0;
  let maxDd = 0;
  for (const r of rs) {
    cum += r;
    if (cum > peak) peak = cum;
    const dd = cum - peak;
    if (dd < maxDd) maxDd = dd;
  }

  return {
    netR: fmtSigned(net),
    netRDelta: `${rs.length} tagged fills`,
    netRTone: net > 0 ? "positive" : net < 0 ? "negative" : "neutral",
    expectancy: fmtSigned(exp, 2),
    expectancyDelta: "Per trade",
    expectancyTone: exp > 0 ? "positive" : exp < 0 ? "negative" : "neutral",
    winRate: `${winPct}%`,
    winRateDelta:
      directional > 0 ? `${wins}W · ${losses}L (${rs.length} with P&L)` : `${rs.length} fill${rs.length === 1 ? "" : "s"}, no wins or losses`,
    winRateTone: winPct >= 50 ? "positive" : "neutral",
    maxDd: fmtSigned(maxDd, 1),
    maxDdDelta: "Worst drawdown vs peak",
    maxDdTone: maxDd < 0 ? "negative" : "neutral",
  };
}

/** Cumulative equity points (oldest → newest), including start 0 */
export function cumulativeSeries(journal: JournalRow[]): number[] {
  const chronological = [...journal].reverse();
  let cum = 0;
  const out: number[] = [0];
  for (const j of chronological) {
    const p = parsePnlAmount(j.r);
    if (p === null) continue;
    cum += p;
    out.push(cum);
  }
  return out;
}
