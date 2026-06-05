import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { displaySessionLabel } from "@/lib/session";
import { rowDisciplineScorePercent } from "@/lib/trades/row-discipline-score";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";

export type TradeAccountLookup = Map<string, { name: string; type?: string }>;

export type TradeResultType = "win" | "loss" | "flat" | "unknown";

const EXIT_BEHAVIOR_TAGS = new Set([
  "Early exit",
  "Late entry",
  "Moved stop",
  "Overtraded",
  "Revenge",
  "FOMO",
  "Broke plan",
]);

export type TradeRow = {
  id: string;
  accountId: string | null;
  accountName: string;
  accountType: string | null;
  entryDate: string;
  entryDateLabel: string;
  entryTime: string;
  symbol: string;
  pnl: number | null;
  pnlLabel: string;
  resultType: TradeResultType;
  /** Not stored in schema — reserved for future use */
  direction: string | null;
  setup: string;
  /** Not stored in schema — reserved for future use */
  timeframe: string | null;
  session: string | null;
  /** Market condition used as risk-context proxy when dedicated risk field is absent */
  risk: string | null;
  mood: string | null;
  exitBehavior: string | null;
  mistakeTag: string | null;
  marketCondition: string | null;
  disciplineScore: number | null;
  hasChart: boolean;
  hasNotes: boolean;
  followedPlan?: boolean;
  respectedStop?: boolean;
  noRevengeTrade?: boolean;
  note?: string;
  lessonLearned?: string;
  chartLinkUrl?: string;
  source: JournalRow;
};

function resultTypeFromPnl(pnl: number | null): TradeResultType {
  if (pnl === null || !Number.isFinite(pnl)) return "unknown";
  if (pnl > 0) return "win";
  if (pnl < 0) return "loss";
  return "flat";
}

function exitBehaviorFromTag(tag: string | undefined): string | null {
  const trimmed = String(tag ?? "").trim();
  if (!trimmed || trimmed === "None" || trimmed === "Manual") return null;
  if (EXIT_BEHAVIOR_TAGS.has(trimmed)) return trimmed;
  if (trimmed.toLowerCase().includes("exit")) return trimmed;
  return null;
}

export function formatTradeDayLabel(dayKey: string): string {
  if (!dayKey) return "—";
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function mapJournalRowToTradeRow(
  row: JournalRow,
  currency = "USD",
  accountLookup?: TradeAccountLookup,
  timezone?: string | null,
): TradeRow {
  const pnl = parsePnlAmount(row.r);
  const dayKey = dayKeyFromRow(row.entryDate, row.createdAt);
  const tag = String(row.tag ?? "").trim() || null;
  const accountId = row.accountId ?? null;
  const accountMeta = accountId ? accountLookup?.get(accountId) : undefined;

  return {
    id: row.id,
    accountId,
    accountName: accountMeta?.name ?? (accountId ? "Account" : "—"),
    accountType: accountMeta?.type ?? null,
    entryDate: dayKey,
    entryDateLabel: formatTradeDayLabel(dayKey),
    entryTime: row.time?.trim() || "—",
    symbol: row.sym?.trim() || "—",
    pnl,
    pnlLabel: pnl !== null ? formatSignedPnlAmount(pnl, currency) : row.r?.trim() || "—",
    resultType: resultTypeFromPnl(pnl),
    direction: null,
    setup: String(row.setup ?? "").trim() || "—",
    timeframe: null,
    session: displaySessionLabel(row, timezone),
    risk: row.marketCondition?.trim() || null,
    mood: row.moodState ?? null,
    exitBehavior: exitBehaviorFromTag(tag ?? undefined) ?? (row.followedPlan === false ? "Missed plan" : null),
    mistakeTag: tag && tag !== "None" ? tag : null,
    marketCondition: row.marketCondition?.trim() || null,
    disciplineScore: rowDisciplineScorePercent(row),
    hasChart: Boolean(row.chartLinkUrl?.trim()),
    hasNotes: Boolean(row.note?.trim() || row.lessonLearned?.trim()),
    followedPlan: row.followedPlan,
    respectedStop: row.respectedStop,
    noRevengeTrade: row.noRevengeTrade,
    note: row.note,
    lessonLearned: row.lessonLearned,
    chartLinkUrl: row.chartLinkUrl,
    source: row,
  };
}

export function mapJournalRowsToTradeRows(
  rows: JournalRow[],
  currency = "USD",
  accountLookup?: TradeAccountLookup,
  timezone?: string | null,
): TradeRow[] {
  return rows.map((row) => mapJournalRowToTradeRow(row, currency, accountLookup, timezone));
}

export function filterTradeRowsByResult(rows: TradeRow[], result: "all" | "wins" | "losses"): TradeRow[] {
  if (result === "all") return rows;
  if (result === "wins") return rows.filter((r) => r.resultType === "win");
  return rows.filter((r) => r.resultType === "loss");
}
