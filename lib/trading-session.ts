/**
 * Approximate major FX cash session windows (UTC).
 * Used only as a contextual hint — not financial advice.
 */

export type ForexSessionLabel = "Sydney" | "Tokyo" | "London" | "New York";

function utcMinutes(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Range that may cross midnight UTC (start inclusive, end exclusive in [0, 1440)). */
function inUtcRangeCrossMidnight(m: number, startMin: number, endMin: number): boolean {
  if (startMin < endMin) return m >= startMin && m < endMin;
  return m >= startMin || m < endMin;
}

/**
 * Which major sessions are in their typical high-liquidity window (UTC).
 */
/** When several sessions overlap, prefer this order for bucketing P&L. */
const PRIMARY_ORDER: ForexSessionLabel[] = ["New York", "London", "Tokyo", "Sydney"];

/**
 * Single session label for attribution when multiple FX windows overlap (UTC).
 * Returns `"Between"` when none of the standard windows apply.
 */
export function primaryForexSessionUTC(now: Date): ForexSessionLabel | "Between" {
  const active = activeForexSessionsUTC(now);
  if (active.length === 0) return "Between";
  for (const p of PRIMARY_ORDER) {
    if (active.includes(p)) return p;
  }
  return active[0];
}

export function activeForexSessionsUTC(now: Date): ForexSessionLabel[] {
  const m = utcMinutes(now);
  const out: ForexSessionLabel[] = [];

  // Sydney ~ 21:00–06:00 UTC
  if (inUtcRangeCrossMidnight(m, 21 * 60, 6 * 60)) out.push("Sydney");
  // Tokyo ~ 00:00–09:00 UTC
  if (m >= 0 && m < 9 * 60) out.push("Tokyo");
  // London ~ 08:00–16:00 UTC
  if (m >= 8 * 60 && m < 16 * 60) out.push("London");
  // New York ~ 13:00–21:00 UTC
  if (m >= 13 * 60 && m < 21 * 60) out.push("New York");

  return out;
}

function sessionHeadline(sessions: ForexSessionLabel[]): string {
  if (sessions.length === 0) return "Between main sessions";
  const set = new Set(sessions);
  if (set.has("London") && set.has("New York")) return "London · New York overlap";
  if (sessions.length === 1) return sessions[0];
  return sessions.join(" · ");
}

export function describeForexSession(now: Date): {
  sessions: ForexSessionLabel[];
  headline: string;
  weekend: boolean;
} {
  const utcDay = now.getUTCDay();
  const weekend = utcDay === 0 || utcDay === 6;
  const sessions = activeForexSessionsUTC(now);
  return {
    sessions,
    headline: sessionHeadline(sessions),
    weekend,
  };
}

/**
 * Validate IANA timezone; fall back to runtime default (browser or UTC).
 */
export function normalizeTimeZoneIana(raw: string | null | undefined): string {
  const fallback = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC" : "UTC";
  const t = (raw ?? "").trim();
  if (!t) return fallback;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: t });
    return t;
  } catch {
    return fallback;
  }
}

export function formatClockInTimeZone(now: Date, timeZone: string): string {
  const tz = normalizeTimeZoneIana(timeZone);
  return new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

export function shortTimeZoneName(now: Date, timeZone: string): string {
  const tz = normalizeTimeZoneIana(timeZone);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  }).formatToParts(now);
  const name = parts.find((p) => p.type === "timeZoneName")?.value;
  return name ?? tz.split("/").pop() ?? tz;
}
