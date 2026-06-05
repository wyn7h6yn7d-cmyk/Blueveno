export const SETUP_TAG_OPTIONS = [
  "Pullback",
  "Breakout",
  "Reversal",
  "Range",
  "News",
  "Trend continuation",
  "Other",
] as const;

export const MISTAKE_TAG_OPTIONS = [
  "None",
  "FOMO",
  "Late entry",
  "Early exit",
  "Moved stop",
  "Overtraded",
  "Revenge",
  "Oversized",
  "Broke plan",
  "Other",
] as const;

/** Must match `journal_entries_session_tag_check` in supabase/migrations/20260429_journal_review_fields.sql */
export const SESSION_TAG_OPTIONS = [
  "London",
  "New York",
  "London/New York overlap",
  "Asia",
  "Other",
] as const;

const SESSION_TAG_SET = new Set<string>(SESSION_TAG_OPTIONS);

export const MARKET_CONDITION_OPTIONS = [
  "Trending",
  "Range",
  "Choppy",
  "High volatility",
  "Low volatility",
  "News-driven",
  "Other",
] as const;

export type SetupTag = (typeof SETUP_TAG_OPTIONS)[number];
export type MistakeTag = (typeof MISTAKE_TAG_OPTIONS)[number];
export type SessionTag = (typeof SESSION_TAG_OPTIONS)[number];

/** True when value is allowed by DB check constraint and UI selects. */
export function isAllowedSessionTag(value: string | null | undefined): value is SessionTag {
  const trimmed = value?.trim();
  return Boolean(trimmed && SESSION_TAG_SET.has(trimmed));
}

/**
 * Coerce UI / detected labels to a DB-safe session_tag (or null).
 * Maps top-bar headline variants and off-session labels to allowed values.
 */
export function sanitizeSessionTagForDb(value: string | null | undefined): SessionTag | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (isAllowedSessionTag(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (lower.includes("london") && lower.includes("new york") && lower.includes("overlap")) {
    return "London/New York overlap";
  }
  if (lower === "london") return "London";
  if (lower === "new york") return "New York";
  if (lower === "asia" || lower === "sydney" || lower === "tokyo") return "Asia";
  if (lower === "other" || lower === "off session" || lower.includes("between main session")) {
    return "Other";
  }

  return null;
}
export type MarketCondition = (typeof MARKET_CONDITION_OPTIONS)[number];
