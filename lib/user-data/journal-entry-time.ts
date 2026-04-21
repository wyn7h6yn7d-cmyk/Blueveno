import type { JournalRow } from "@/lib/user-data/types";

/**
 * Best-effort moment for session attribution: prefers `createdAt`, else `entryDate` + parsed time,
 * else `entryDate` at 12:00 UTC (neutral default when only a calendar day is known).
 */
export function journalEntryMoment(row: JournalRow): Date {
  if (row.createdAt) {
    const t = Date.parse(row.createdAt);
    if (!Number.isNaN(t)) return new Date(t);
  }
  const day = row.entryDate?.trim();
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const isoTime = parseTimeToIsoFragment(row.time);
    if (isoTime) {
      const d = Date.parse(`${day}T${isoTime}.000Z`);
      if (!Number.isNaN(d)) return new Date(d);
    }
    return new Date(`${day}T12:00:00.000Z`);
  }
  return new Date();
}

/** Parses "14:30", "9:05", "14:30:00" into HH:MM:SS for ISO date combination (interpreted as local by Date.parse in some engines — we use explicit Z below). */
function parseTimeToIsoFragment(timeField: string): string | null {
  const t = timeField.trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number.parseInt(m[1], 10);
  const min = Number.parseInt(m[2], 10);
  const sec = m[3] != null ? Number.parseInt(m[3], 10) : 0;
  if (h < 0 || h > 23 || min < 0 || min > 59 || sec < 0 || sec > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
