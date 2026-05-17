export const WEEKLY_REFLECTION_SELECT_FULL =
  "week_start, account_id, what_worked, what_slipped, next_week_focus, next_week_rule, confidence_score, weekly_note";

export const WEEKLY_REFLECTION_SELECT_WITH_ACCOUNT =
  "week_start, account_id, what_worked, what_slipped, next_week_focus";

export const WEEKLY_REFLECTION_SELECT_LEGACY =
  "week_start, what_worked, what_slipped, next_week_focus";

export const WEEKLY_REFLECTION_SELECT_CHAIN = [
  WEEKLY_REFLECTION_SELECT_FULL,
  WEEKLY_REFLECTION_SELECT_WITH_ACCOUNT,
  WEEKLY_REFLECTION_SELECT_LEGACY,
] as const;

export function weeklyReflectionSelectUsesAccount(select: string): boolean {
  return select.includes("account_id");
}

export function isRetryableWeeklyReflectionSchemaError(
  message: string | undefined,
  code?: string | undefined,
): boolean {
  const m = (message ?? "").toLowerCase();
  const c = (code ?? "").toUpperCase();
  if (c === "PGRST205") return true;
  if (!m) return false;
  if (m.includes("schema cache")) return true;
  if (m.includes("weekly_reflections") && m.includes("does not exist") && !m.includes("column")) {
    return false;
  }
  return (
    m.includes("does not exist") ||
    m.includes("could not find") ||
    (m.includes("column") &&
      (m.includes("account_id") ||
        m.includes("next_week_rule") ||
        m.includes("confidence_score") ||
        m.includes("weekly_note")))
  );
}

/** True when the weekly_reflections table itself is absent (not just optional columns). */
export function isWeeklyReflectionTableMissing(
  message: string | undefined,
  code?: string | undefined,
): boolean {
  const m = (message ?? "").toLowerCase();
  const c = (code ?? "").toUpperCase();
  if (c === "PGRST205") return true;
  return (
    m.includes("weekly_reflections") &&
    (m.includes("could not find the table") || m.includes("does not exist")) &&
    !m.includes("column")
  );
}

type WeeklyQueryResult<T> = { data: T | null; error: { message?: string; code?: string } | null };

export async function queryWeeklyReflectionWithFallback<T>(
  query: (select: string, useAccountScope: boolean) => WeeklyQueryResult<T> | Promise<WeeklyQueryResult<T>>,
): Promise<WeeklyQueryResult<T>> {
  let last: WeeklyQueryResult<T> = { data: null, error: null };
  for (const select of WEEKLY_REFLECTION_SELECT_CHAIN) {
    const result = await Promise.resolve(query(select, weeklyReflectionSelectUsesAccount(select)));
    last = result;
    if (!result.error) return result;
    if (!isRetryableWeeklyReflectionSchemaError(result.error.message, result.error.code)) return result;
  }
  return last;
}
