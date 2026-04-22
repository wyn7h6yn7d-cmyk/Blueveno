/** journal_entries select lists — retry without entry_date when migration not applied yet. */
export const JOURNAL_SELECT_WITH_ENTRY_DATE =
  "id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url, mood_state, followed_plan, respected_stop, no_revenge_trade";

export const JOURNAL_SELECT_WITHOUT_ENTRY_DATE =
  "id, created_at, entry_time, symbol, setup, r_value, tag, note, tradingview_url";

export function isMissingEntryDateColumnError(message: string | undefined): boolean {
  const m = (message ?? "").toLowerCase();
  const missingColumn =
    m.includes("entry_date") ||
    m.includes("mood_state") ||
    m.includes("followed_plan") ||
    m.includes("respected_stop") ||
    m.includes("no_revenge_trade");
  return missingColumn && (m.includes("does not exist") || m.includes("column"));
}
