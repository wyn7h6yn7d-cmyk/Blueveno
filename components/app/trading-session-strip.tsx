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
        "relative flex min-h-[2.5rem] shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2 text-[11px] md:px-5 md:py-2.5",
        "border-b border-[oklch(0.48_0.12_252/0.35)]",
        "bg-[linear-gradient(92deg,oklch(0.16_0.07_262/0.92)_0%,oklch(0.11_0.055_268/0.96)_42%,oklch(0.13_0.06_256/0.94)_100%)]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.07),0_8px_28px_-12px_oklch(0.35_0.12_252/0.25)]",
      )}
      title="Approximate major FX session windows (UTC). Clock uses your timezone from Settings."
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.58_0.14_252/0.45)] to-transparent"
        aria-hidden
      />

      <div className="relative flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <div
          className={cn(
            "inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border border-[oklch(0.52_0.12_252/0.32)]",
            "bg-[linear-gradient(165deg,oklch(0.22_0.08_262/0.55)_0%,oklch(0.12_0.05_268/0.65)_100%)]",
            "px-3 py-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.1)] sm:px-3.5",
          )}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[oklch(0.72_0.11_252)]">
            Session
          </span>
          <span className="text-zinc-400">
            {weekend ? <span className="text-zinc-500">Weekend · </span> : null}
            <span className="font-semibold text-zinc-50">{headline}</span>
          </span>
        </div>

        <span
          className="hidden h-4 w-px shrink-0 bg-[oklch(0.55_0.12_252/0.35)] sm:inline-block"
          aria-hidden
        />

        <div
          className={cn(
            "inline-flex items-center rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-1 font-mono tabular-nums text-zinc-300",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)]",
          )}
        >
          <span className="text-zinc-200">{clock}</span>
          <span className="ml-2 text-[10px] text-zinc-500">{abbr}</span>
        </div>
      </div>

      <Link
        href="/app/settings"
        className="relative inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[oklch(0.5_0.11_252/0.25)] bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[oklch(0.78_0.11_252)] transition hover:border-[oklch(0.58_0.12_252/0.4)] hover:bg-[oklch(0.2_0.06_262/0.35)] hover:text-[oklch(0.9_0.1_252)]"
      >
        <Settings className="size-3 opacity-90" strokeWidth={1.75} />
        Timezone
      </Link>
    </div>
  );
}
