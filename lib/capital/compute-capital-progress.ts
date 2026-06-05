import type { LineAreaPoint } from "@/components/v2/charts/line-area-chart";
import { computeTradingStats, type DailyBar } from "@/lib/user-data/trading-stats";
import type { JournalRow } from "@/lib/user-data/types";
import type { TradingAccount } from "@/lib/trading-accounts/types";

/** Optional pacing reference — not a firm or broker rule. */
export const PACING_PROFIT_TARGET_PCT = 0.1;

export type MonthlyCapitalRow = {
  key: string;
  label: string;
  pnl: number;
  endBalance: number | null;
};

export type LinkedAccountCapitalRow = {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  isActive: boolean;
  netPnl: number;
  startingBalance: number | null;
  estimatedBalance: number | null;
  tradedDays: number;
};

export type CapitalProgressSnapshot = {
  hasJournalData: boolean;
  netPnl: number;
  startingBalance: number | null;
  estimatedBalance: number | null;
  returnPct: number | null;
  profitTarget: number | null;
  profitTargetLabel: string | null;
  peakEquity: number | null;
  currentDrawdown: number | null;
  maxDrawdown: number | null;
  equityCurve: LineAreaPoint[];
  monthlyCapital: MonthlyCapitalRow[];
  insights: string[];
};

function shortDate(dayKey: string): string {
  if (!dayKey) return "—";
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

export function estimatedBalance(startingBalance: number | null, netPnl: number): number | null {
  if (startingBalance === null || !Number.isFinite(startingBalance)) return null;
  return startingBalance + netPnl;
}

export function buildBalanceEquityCurve(dailyBars: DailyBar[], startingBalance: number | null): LineAreaPoint[] {
  if (dailyBars.length === 0) return [];
  const base = startingBalance ?? 0;
  let equity = base;
  let cumulativePnl = 0;
  return dailyBars.map((d) => {
    const dailyPnl = Number.isFinite(d.pnl) ? d.pnl : 0;
    cumulativePnl += dailyPnl;
    equity += dailyPnl;
    const balance = Number(equity.toFixed(2));
    return {
      day: shortDate(d.date),
      dayKey: d.date,
      pnl: balance,
      balance,
      dailyPnl: Number(dailyPnl.toFixed(2)),
      cumulativePnl: Number(cumulativePnl.toFixed(2)),
    };
  });
}

export function drawdownStatsFromEquity(dailyBars: DailyBar[], startingBalance: number | null): {
  peakEquity: number | null;
  currentDrawdown: number | null;
  maxDrawdown: number | null;
} {
  if (dailyBars.length === 0) {
    return { peakEquity: null, currentDrawdown: null, maxDrawdown: null };
  }

  const base = startingBalance ?? 0;
  let equity = base;
  let peak = base;
  let maxDrawdown = 0;

  for (const d of dailyBars) {
    equity += d.pnl;
    if (equity > peak) peak = equity;
    const drawdown = equity - peak;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  }

  const currentDrawdown = equity - peak;
  return {
    peakEquity: startingBalance !== null ? peak : peak > 0 ? peak : null,
    currentDrawdown: currentDrawdown < 0 ? currentDrawdown : 0,
    maxDrawdown: maxDrawdown < 0 ? maxDrawdown : 0,
  };
}

export function buildMonthlyCapitalRows(
  monthly: Array<{ key: string; label: string; total: number }>,
  startingBalance: number | null,
): MonthlyCapitalRow[] {
  if (startingBalance === null) {
    return monthly.map((m) => ({ key: m.key, label: m.label, pnl: m.total, endBalance: null }));
  }
  let running = startingBalance;
  return monthly.map((m) => {
    running += m.total;
    return { key: m.key, label: m.label, pnl: m.total, endBalance: running };
  });
}

function buildInsights(params: {
  netPnl: number;
  startingBalance: number | null;
  tradedDays: number;
  maxDrawdown: number | null;
  winRate: number | null;
  monthly: MonthlyCapitalRow[];
}): string[] {
  const notes: string[] = [];
  const { netPnl, startingBalance, tradedDays, maxDrawdown, winRate, monthly } = params;

  if (startingBalance === null) {
    notes.push("Add a starting balance in Settings to unlock estimated balance and capital curve tracking.");
  } else {
    const ret = startingBalance !== 0 ? (netPnl / startingBalance) * 100 : null;
    if (ret !== null) {
      notes.push(`Journal return is ${ret >= 0 ? "+" : ""}${ret.toFixed(1)}% vs your recorded starting balance.`);
    }
  }

  if (tradedDays > 0) {
    notes.push(`Progress is based on ${tradedDays} traded day${tradedDays === 1 ? "" : "s"} logged in this account.`);
  }

  if (maxDrawdown !== null && maxDrawdown < 0) {
    notes.push(`Largest dip from peak estimated balance: ${Math.abs(maxDrawdown).toFixed(0)} (journal-derived).`);
  }

  if (winRate !== null) {
    notes.push(`Trade win rate on this account: ${winRate}%.`);
  }

  const recent = monthly.slice(-3);
  if (recent.length >= 2) {
    const avg = recent.reduce((s, m) => s + m.pnl, 0) / recent.length;
    if (avg > 0) notes.push(`Recent months average +${avg.toFixed(0)} journal P&L.`);
    else if (avg < 0) notes.push(`Recent months average ${avg.toFixed(0)} journal P&L — review pacing.`);
  }

  notes.push("Not connected to your broker. For reference and journaling only.");

  return notes;
}

export function computeCapitalProgress(
  account: Pick<TradingAccount, "startingBalance" | "currency">,
  entries: JournalRow[],
): CapitalProgressSnapshot {
  const stats = computeTradingStats(entries, []);
  const netPnl = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;
  const startingBalance = account.startingBalance;
  const balance = estimatedBalance(startingBalance, netPnl);
  const returnPct =
    startingBalance !== null && startingBalance !== 0 ? (netPnl / startingBalance) * 100 : null;

  const profitTarget =
    startingBalance !== null && startingBalance > 0
      ? Number((startingBalance * PACING_PROFIT_TARGET_PCT).toFixed(2))
      : null;

  const { peakEquity, currentDrawdown, maxDrawdown } = drawdownStatsFromEquity(stats.dailyBars, startingBalance);
  const equityCurve =
    startingBalance !== null
      ? buildBalanceEquityCurve(stats.dailyBars, startingBalance)
      : buildBalanceEquityCurve(stats.dailyBars, 0);

  const monthlyCapital = buildMonthlyCapitalRows(stats.monthly, startingBalance);
  const insights = buildInsights({
    netPnl,
    startingBalance,
    tradedDays: stats.dailyBars.length,
    maxDrawdown,
    winRate: stats.winRateTrades,
    monthly: monthlyCapital,
  });

  return {
    hasJournalData: entries.length > 0,
    netPnl,
    startingBalance,
    estimatedBalance: balance,
    returnPct,
    profitTarget,
    profitTargetLabel:
      profitTarget !== null ? `${(PACING_PROFIT_TARGET_PCT * 100).toFixed(0)}% pacing target` : null,
    peakEquity,
    currentDrawdown,
    maxDrawdown,
    equityCurve,
    monthlyCapital,
    insights,
  };
}

export function computeLinkedAccountRows(
  accounts: TradingAccount[],
  entriesByAccount: Map<string, JournalRow[]>,
  activeAccountId: string | null,
): LinkedAccountCapitalRow[] {
  return accounts.map((account) => {
    const entries = entriesByAccount.get(account.id) ?? [];
    const stats = computeTradingStats(entries, []);
    const netPnl = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;
    return {
      id: account.id,
      name: account.name,
      accountType: account.accountType,
      currency: account.currency,
      isActive: account.id === activeAccountId,
      netPnl,
      startingBalance: account.startingBalance,
      estimatedBalance: estimatedBalance(account.startingBalance, netPnl),
      tradedDays: stats.dailyBars.length,
    };
  });
}
