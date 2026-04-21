/** journal_entries select lists — retry without entry_date when migration not applied yet. */
export const JOURNAL_SELECT_WITH_ENTRY_DATE =
  "id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url";

export const JOURNAL_SELECT_WITHOUT_ENTRY_DATE =
  "id, created_at, entry_time, symbol, setup, r_value, tag, note, tradingview_url";

export function isMissingEntryDateColumnError(message: string | undefined): boolean {
  const m = (message ?? "").toLowerCase();
  return m.includes("entry_date") && (m.includes("does not exist") || m.includes("column"));
}
