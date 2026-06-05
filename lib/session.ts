import { activeForexSessionsUTC, describeForexSession, normalizeTimeZoneIana } from "@/lib/trading-session";
import { sanitizeSessionTagForDb, type SessionTag } from "@/lib/user-data/journal-tags";
import type { JournalRow } from "@/lib/user-data/types";

const GENERIC_ENTRY_TIMES = new Set(["", "day close", "—", "-"]);

/**
 * Map active FX windows (UTC) to journal `session_tag` values.
 * Returns only DB-allowed tags (see `SESSION_TAG_OPTIONS` / `journal_entries_session_tag_check`).
 * Off-session windows map to `"Other"` (there is no separate "Off session" column value).
 */
export function getTradingSession(at: Date, _timezone?: string | null): SessionTag {
  if (!(at instanceof Date) || !Number.isFinite(at.getTime())) {
    return getTradingSession(new Date(), _timezone);
  }

  const sessions = activeForexSessionsUTC(at);
  const set = new Set(sessions);
  if (set.has("London") && set.has("New York")) return "London/New York overlap";
  if (set.has("London")) return "London";
  if (set.has("New York")) return "New York";
  if (set.has("Sydney") || set.has("Tokyo")) return "Asia";
  return "Other";
}

/** Headline label shown in the workspace top bar session badge. */
export function getTradingSessionHeadline(at: Date): string {
  if (!(at instanceof Date) || !Number.isFinite(at.getTime())) {
    return describeForexSession(new Date()).headline;
  }
  return describeForexSession(at).headline;
}

/** Default session for a new journal entry (date-only forms use “now”). */
export function getDefaultSessionTagForNewEntry(timezone?: string | null): SessionTag {
  void timezone;
  return getTradingSession(new Date(), timezone);
}

function hasSpecificEntryTime(time: string | undefined): boolean {
  const t = (time ?? "").trim().toLowerCase();
  if (!t || GENERIC_ENTRY_TIMES.has(t)) return false;
  return /\d{1,2}:\d{2}/.test(t) || /\d{1,2}\s*(am|pm)/i.test(t);
}

function parseWallClockOnDay(dayKey: string, time: string): Date | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh > 23 || mm > 59) return null;
  const iso = `${dayKey}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  const parsed = new Date(iso);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

type EntrySessionFields = Pick<JournalRow, "entryDate" | "time" | "createdAt">;

/**
 * Best-effort instant for session attribution on an existing entry (display fallback only).
 */
export function resolveEntrySessionMoment(
  row: EntrySessionFields,
  options?: { preferNowForGenericTime?: boolean; timezone?: string | null },
): Date {
  void normalizeTimeZoneIana(options?.timezone);
  const now = new Date();

  if (options?.preferNowForGenericTime && !hasSpecificEntryTime(row.time)) {
    return now;
  }

  const dayKey = row.entryDate?.trim() ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey) && hasSpecificEntryTime(row.time)) {
    const parsed = parseWallClockOnDay(dayKey, row.time);
    if (parsed) return parsed;
  }

  if (row.createdAt) {
    const created = new Date(row.createdAt);
    if (Number.isFinite(created.getTime())) return created;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    const midday = new Date(`${dayKey}T12:00:00.000Z`);
    if (Number.isFinite(midday.getTime())) return midday;
  }

  return now;
}

/** Saved session tag, or computed fallback — never mutates stored data. */
export function displaySessionLabel(
  row: Pick<JournalRow, "sessionTag"> & EntrySessionFields,
  timezone?: string | null,
): string {
  const saved = row.sessionTag?.trim();
  if (saved) {
    const normalized = sanitizeSessionTagForDb(saved);
    if (normalized) return normalized;
  }
  const moment = resolveEntrySessionMoment(row, { timezone });
  return getTradingSession(moment, timezone);
}

export { sanitizeSessionTagForDb } from "@/lib/user-data/journal-tags";
