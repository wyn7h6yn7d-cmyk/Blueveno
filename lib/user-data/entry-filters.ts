import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";

export type EntryFilters = {
  from: string;
  to: string;
  symbol: string;
  mood: string;
  setup: string;
  mistake: string;
  session: string;
  market: string;
  dayColor: "all" | "green" | "red";
  followedPlan: boolean;
  respectedStop: boolean;
  noRevengeTrade: boolean;
  search: string;
};

export const EMPTY_ENTRY_FILTERS: EntryFilters = {
  from: "",
  to: "",
  symbol: "all",
  mood: "all",
  setup: "all",
  mistake: "all",
  session: "all",
  market: "all",
  dayColor: "all",
  followedPlan: false,
  respectedStop: false,
  noRevengeTrade: false,
  search: "",
};

function rowDay(row: JournalRow): string {
  if (row.entryDate) return row.entryDate;
  if (row.createdAt) return new Date(row.createdAt).toISOString().slice(0, 10);
  return "";
}

export function applyEntryFilters(rows: JournalRow[], filters: EntryFilters): JournalRow[] {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    const day = rowDay(row);
    if (filters.from && day && day < filters.from) return false;
    if (filters.to && day && day > filters.to) return false;
    if (filters.symbol !== "all" && row.sym.toUpperCase() !== filters.symbol.toUpperCase()) return false;
    if (filters.mood !== "all" && (row.moodState ?? "") !== filters.mood) return false;
    if (filters.setup !== "all" && (row.setup ?? "") !== filters.setup) return false;
    if (filters.mistake !== "all" && (row.tag ?? "") !== filters.mistake) return false;
    if (filters.session !== "all" && (row.sessionTag ?? "") !== filters.session) return false;
    if (filters.market !== "all" && (row.marketCondition ?? "") !== filters.market) return false;
    if (filters.followedPlan && !row.followedPlan) return false;
    if (filters.respectedStop && !row.respectedStop) return false;
    if (filters.noRevengeTrade && !row.noRevengeTrade) return false;
    const pnl = parsePnlAmount(row.r);
    if (filters.dayColor === "green" && !((pnl ?? 0) > 0)) return false;
    if (filters.dayColor === "red" && !((pnl ?? 0) < 0)) return false;
    if (q) {
      const inSym = row.sym.toLowerCase().includes(q);
      const inNote = (row.note ?? "").toLowerCase().includes(q);
      if (!inSym && !inNote) return false;
    }
    return true;
  });
}

export function hasActiveFilters(filters: EntryFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(EMPTY_ENTRY_FILTERS);
}

export function filterChips(filters: EntryFilters): string[] {
  const chips: string[] = [];
  if (filters.from) chips.push(`from ${filters.from}`);
  if (filters.to) chips.push(`to ${filters.to}`);
  if (filters.symbol !== "all") chips.push(`symbol: ${filters.symbol}`);
  if (filters.mood !== "all") chips.push(`mood: ${filters.mood}`);
  if (filters.setup !== "all") chips.push(`setup: ${filters.setup}`);
  if (filters.mistake !== "all") chips.push(`mistake: ${filters.mistake}`);
  if (filters.session !== "all") chips.push(`session: ${filters.session}`);
  if (filters.market !== "all") chips.push(`market: ${filters.market}`);
  if (filters.dayColor !== "all") chips.push(`${filters.dayColor} days`);
  if (filters.followedPlan) chips.push("followed plan");
  if (filters.respectedStop) chips.push("respected stop");
  if (filters.noRevengeTrade) chips.push("no revenge");
  if (filters.search.trim()) chips.push(`search: ${filters.search.trim()}`);
  return chips;
}

export function parseFiltersFromParams(params: URLSearchParams): EntryFilters {
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const symbol = params.get("symbol") ?? "all";
  const mood = params.get("mood") ?? "all";
  const setup = params.get("setup") ?? "all";
  const mistake = params.get("mistake") ?? "all";
  const session = params.get("session") ?? "all";
  const market = params.get("market") ?? "all";
  const dayColorRaw = params.get("dayColor");
  const dayColor: "all" | "green" | "red" =
    dayColorRaw === "green" || dayColorRaw === "red" ? dayColorRaw : "all";
  const search = params.get("q") ?? "";
  return {
    from,
    to,
    symbol,
    mood,
    setup,
    mistake,
    session,
    market,
    dayColor,
    followedPlan: params.get("followedPlan") === "1",
    respectedStop: params.get("respectedStop") === "1",
    noRevengeTrade: params.get("noRevengeTrade") === "1",
    search,
  };
}

export function writeFiltersToParams(base: URLSearchParams, filters: EntryFilters): URLSearchParams {
  const next = new URLSearchParams(base.toString());
  const assign = (key: string, value: string, emptyValue: string) => {
    if (!value || value === emptyValue) next.delete(key);
    else next.set(key, value);
  };
  assign("from", filters.from, "");
  assign("to", filters.to, "");
  assign("symbol", filters.symbol, "all");
  assign("mood", filters.mood, "all");
  assign("setup", filters.setup, "all");
  assign("mistake", filters.mistake, "all");
  assign("session", filters.session, "all");
  assign("market", filters.market, "all");
  assign("dayColor", filters.dayColor, "all");
  assign("q", filters.search, "");
  if (filters.followedPlan) next.set("followedPlan", "1");
  else next.delete("followedPlan");
  if (filters.respectedStop) next.set("respectedStop", "1");
  else next.delete("respectedStop");
  if (filters.noRevengeTrade) next.set("noRevengeTrade", "1");
  else next.delete("noRevengeTrade");
  return next;
}

export function uniqueValues(rows: JournalRow[], pick: (row: JournalRow) => string | undefined): string[] {
  return Array.from(new Set(rows.map(pick).filter((v): v is string => Boolean(v && v.trim())))).sort((a, b) =>
    a.localeCompare(b),
  );
}
