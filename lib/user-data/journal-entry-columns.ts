/** Full journal row — all app columns */
export const JOURNAL_SELECT_FULL =
  "id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, chart_link_url, mood_state, followed_plan, respected_stop, no_revenge_trade, session_tag, market_condition, lesson_learned, rule_checks";

/** Fallback when newer optional columns are missing — keeps discipline + mood */
export const JOURNAL_SELECT_BEHAVIOR =
  "id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, chart_link_url, mood_state, followed_plan, respected_stop, no_revenge_trade";

/** Fallback when entry_date column is missing — still loads behavior toggles */
export const JOURNAL_SELECT_BEHAVIOR_NO_ENTRY_DATE =
  "id, created_at, entry_time, symbol, setup, r_value, tag, note, chart_link_url, mood_state, followed_plan, respected_stop, no_revenge_trade";

/** Legacy minimal row — no behavior layer */
export const JOURNAL_SELECT_LEGACY =
  "id, created_at, entry_time, symbol, setup, r_value, tag, note, chart_link_url";

/** @deprecated Use {@link JOURNAL_SELECT_FULL} */
export const JOURNAL_SELECT_WITH_ENTRY_DATE = JOURNAL_SELECT_FULL;

/** @deprecated Use {@link JOURNAL_SELECT_LEGACY} */
export const JOURNAL_SELECT_WITHOUT_ENTRY_DATE = JOURNAL_SELECT_LEGACY;

export const JOURNAL_SELECT_CHAIN = [
  JOURNAL_SELECT_FULL,
  JOURNAL_SELECT_BEHAVIOR,
  JOURNAL_SELECT_BEHAVIOR_NO_ENTRY_DATE,
  JOURNAL_SELECT_LEGACY,
] as const;

export function isRetryableJournalSchemaError(message: string | undefined): boolean {
  const m = (message ?? "").toLowerCase();
  if (!m) return false;
  return (
    m.includes("schema cache") ||
    m.includes("does not exist") ||
    m.includes("could not find") ||
    (m.includes("column") &&
      (m.includes("entry_date") ||
        m.includes("mood_state") ||
        m.includes("followed_plan") ||
        m.includes("respected_stop") ||
        m.includes("no_revenge_trade") ||
        m.includes("session_tag") ||
        m.includes("market_condition") ||
        m.includes("lesson_learned") ||
        m.includes("rule_checks")))
  );
}

/** @deprecated Use {@link isRetryableJournalSchemaError} */
export function isMissingEntryDateColumnError(message: string | undefined): boolean {
  return isRetryableJournalSchemaError(message);
}

type JournalQueryResult<T> = { data: T | null; error: { message?: string } | null };

/** Try progressively smaller selects so missing optional columns do not drop discipline fields. */
export async function queryJournalWithSelectFallback<T>(
  query: (select: string) => JournalQueryResult<T> | Promise<JournalQueryResult<T>>,
): Promise<JournalQueryResult<T>> {
  let last: JournalQueryResult<T> = { data: null, error: null };
  for (const select of JOURNAL_SELECT_CHAIN) {
    const result = await Promise.resolve(query(select));
    last = result;
    if (!result.error) return result;
    if (!isRetryableJournalSchemaError(result.error.message)) return result;
  }
  return last;
}
