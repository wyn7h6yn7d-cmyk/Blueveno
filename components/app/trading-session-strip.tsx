"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
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

export function TradingSessionStrip({ serverTimeZone }: Props) {
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
      className={cn(
        "flex min-h-[1.75rem] shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/[0.06] bg-black/25 px-3 py-1.5 text-[11px] backdrop-blur-md md:px-5",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Session</span>
        <span className="text-zinc-400">
          {weekend ? <span className="text-zinc-500">Weekend · </span> : null}
          <span className="font-medium text-zinc-200">{headline}</span>
        </span>
        <span
          className="hidden h-3 w-px bg-white/[0.1] sm:inline-block"
          aria-hidden
        />
        <span className="font-mono tabular-nums text-zinc-500 sm:text-zinc-400">
          {clock}{" "}
          <span className="text-zinc-600">{abbr}</span>
        </span>
      </div>
      <Link
        href="/app/settings"
        className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[oklch(0.72_0.1_252)] hover:text-[oklch(0.82_0.12_252)]"
      >
        <Settings className="size-3 opacity-80" strokeWidth={1.75} />
        Timezone
      </Link>
    </div>
  );
}
