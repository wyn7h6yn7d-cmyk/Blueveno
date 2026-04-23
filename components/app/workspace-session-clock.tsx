"use client";

import { useEffect, useMemo, useState } from "react";
import {
  describeForexSession,
  formatClockInTimeZone,
  normalizeTimeZoneIana,
  shortTimeZoneName,
} from "@/lib/trading-session";
import { cn } from "@/lib/utils";

type Props = {
  /** IANA timezone from profile; if unset, uses the browser zone after mount. */
  serverTimeZone?: string | null;
};

/**
 * Compact session label + live clock for the app topbar (timezone is configured in Settings).
 */
export function WorkspaceSessionClock({ serverTimeZone }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const zone = useMemo(
    () => normalizeTimeZoneIana(serverTimeZone?.trim() ? serverTimeZone : undefined),
    [serverTimeZone],
  );

  const { headline, weekend } = useMemo(() => describeForexSession(now), [now]);
  const clock = formatClockInTimeZone(now, zone);
  const abbr = shortTimeZoneName(now, zone);

  return (
    <div
      className="flex min-w-0 max-w-full flex-wrap items-center gap-1 sm:gap-2"
      title="FX session windows are approximate (UTC). Clock uses your timezone from Settings."
    >
      <div
        className={cn(
          "inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg border border-white/[0.1]",
          "bg-white/[0.04] px-1.5 py-0.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:px-2.5 sm:py-1 sm:max-w-none",
        )}
      >
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-500 sm:text-[9px] sm:tracking-[0.2em]">
          Session
        </span>
        <span className="min-w-0 truncate text-[11px] text-zinc-400 sm:text-[12px]">
          {weekend ? <span className="text-zinc-500">Weekend · </span> : null}
          <span className="font-semibold text-zinc-100">{headline}</span>
        </span>
      </div>

      <div
        className={cn(
          "inline-flex items-center rounded-lg border border-white/[0.08] bg-black/25 px-2 py-0.5 font-mono tabular-nums text-zinc-300",
          "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-2.5 sm:py-1",
        )}
      >
        <span className="text-[11px] text-zinc-200 sm:text-[12px]">{clock}</span>
        <span className="ml-1.5 text-[9px] text-zinc-500 sm:ml-2 sm:text-[10px]">{abbr}</span>
      </div>
    </div>
  );
}
