"use client";

import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import type { SessionPnlRow } from "@/lib/user-data/trading-stats";
import type { SessionAnalysisHighlight, SessionTagPerformanceRow } from "@/lib/user-data/session-analysis";
import { appInnerPanel, appKicker } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type SessionComparisonPanelProps = {
  marketSessions: SessionPnlRow[];
  taggedSessions: SessionTagPerformanceRow[];
  currency: string;
  bestMarketSession?: SessionAnalysisHighlight;
  weakestMarketSession?: SessionAnalysisHighlight;
  bestTaggedSession?: SessionAnalysisHighlight;
  weakestTaggedSession?: SessionAnalysisHighlight;
  statsHref?: string;
  compact?: boolean;
  className?: string;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null || !Number.isFinite(n)) return "—";
  return formatSignedPnlAmount(n, currency);
}

function HighlightPills({
  bestMarket,
  weakestMarket,
  bestTag,
  weakestTag,
  currency,
}: {
  bestMarket?: SessionAnalysisHighlight;
  weakestMarket?: SessionAnalysisHighlight;
  bestTag?: SessionAnalysisHighlight;
  weakestTag?: SessionAnalysisHighlight;
  currency: string;
}) {
  const pills = [
    bestMarket ? { label: `Best window · ${bestMarket.label}`, value: bestMarket.totalPnl, tone: 1 as const } : null,
    weakestMarket && weakestMarket.label !== bestMarket?.label
      ? { label: `Weakest window · ${weakestMarket.label}`, value: weakestMarket.totalPnl, tone: -1 as const }
      : null,
    bestTag ? { label: `Best tag · ${bestTag.label}`, value: bestTag.totalPnl, tone: 1 as const } : null,
    weakestTag && weakestTag.label !== bestTag?.label
      ? { label: `Weakest tag · ${weakestTag.label}`, value: weakestTag.totalPnl, tone: -1 as const }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: number; tone: 1 | -1 }>;

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <span
          key={pill.label}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            pill.tone > 0
              ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/25 bg-rose-500/10 text-rose-100",
          )}
        >
          <span className="text-zinc-400">{pill.label}</span>
          <span className="tabular-nums">{fmtPnl(pill.value, currency)}</span>
        </span>
      ))}
    </div>
  );
}

function MarketSessionBars({
  rows,
  currency,
}: {
  rows: SessionPnlRow[];
  currency: string;
}) {
  const withTrades = rows.filter((r) => r.entries > 0);
  if (withTrades.length === 0) {
    return (
      <p className={cn(appInnerPanel, "px-4 py-3 text-[12px] text-zinc-500")}>
        Log trades with times to see which FX windows work best for you (UTC buckets).
      </p>
    );
  }

  const maxAbs = Math.max(...withTrades.map((r) => Math.abs(r.totalPnl)), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((row) => {
        const hasData = row.entries > 0;
        const width = hasData ? (Math.abs(row.totalPnl) / maxAbs) * 100 : 0;
        const winRate = row.entries > 0 ? Math.round((row.winEntries / row.entries) * 100) : null;
        return (
          <div key={row.session} className={cn(appInnerPanel, "px-3 py-2.5", !hasData && "opacity-55")}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-zinc-200">{row.session}</p>
                <p className="text-[11px] text-zinc-500">
                  {hasData ? (
                    <>
                      {row.entries} {row.entries === 1 ? "entry" : "entries"}
                      {winRate !== null ? ` · ${winRate}% win` : ""}
                    </>
                  ) : (
                    "No entries in this window"
                  )}
                </p>
              </div>
              <p
                className={cn(
                  "shrink-0 font-mono text-[12px] tabular-nums",
                  !hasData && "text-zinc-500",
                  hasData && row.totalPnl > 0 && "text-emerald-200",
                  hasData && row.totalPnl < 0 && "text-rose-200",
                  hasData && row.totalPnl === 0 && "text-zinc-300",
                )}
              >
                {hasData ? fmtPnl(row.totalPnl, currency) : "—"}
              </p>
            </div>
            {hasData ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    row.totalPnl > 0 && "bg-emerald-400/70",
                    row.totalPnl < 0 && "bg-rose-400/70",
                    row.totalPnl === 0 && "bg-zinc-500/50",
                  )}
                  style={{ width: `${Math.max(width, row.totalPnl !== 0 ? 6 : 0)}%` }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
      <p className="text-[11px] leading-relaxed text-zinc-600">
        Based on entry time in UTC (Sydney, Tokyo, London, New York). Overlaps resolve to the busiest session.
      </p>
    </div>
  );
}

function TaggedSessionList({
  rows,
  currency,
  emptyLabel,
}: {
  rows: SessionTagPerformanceRow[];
  currency: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className={cn(appInnerPanel, "px-4 py-3 text-[12px] text-zinc-500")}>{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.slice(0, 6).map((row) => (
        <div key={row.label} className={cn(appInnerPanel, "grid grid-cols-[1fr_auto] gap-3 px-3.5 py-2.5")}>
          <div>
            <p className="text-[13px] text-zinc-200">{row.label}</p>
            <p className="text-[11px] text-zinc-500">
              Avg {fmtPnl(row.averagePnl, currency)} · {row.entries} entries
              {row.winRate !== null ? ` · ${row.winRate}% win` : ""}
            </p>
          </div>
          <p
            className={cn(
              "font-mono text-[12px] tabular-nums",
              row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-300",
            )}
          >
            {fmtPnl(row.totalPnl, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SessionComparisonPanel({
  marketSessions,
  taggedSessions,
  currency,
  bestMarketSession,
  weakestMarketSession,
  bestTaggedSession,
  weakestTaggedSession,
  statsHref = "/app/stats?tab=patterns",
  compact = false,
  className,
}: SessionComparisonPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <HighlightPills
        bestMarket={bestMarketSession}
        weakestMarket={weakestMarketSession}
        bestTag={bestTaggedSession}
        weakestTag={weakestTaggedSession}
        currency={currency}
      />

      <div className={cn("grid gap-5", compact ? "grid-cols-1" : "lg:grid-cols-2")}>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-zinc-500" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="text-[13px] font-medium text-zinc-300">Market sessions (UTC)</p>
              <p className={appKicker}>Where your entries cluster by FX window</p>
            </div>
          </div>
          <MarketSessionBars rows={marketSessions} currency={currency} />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-zinc-500" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="text-[13px] font-medium text-zinc-300">Your session tags</p>
              <p className={appKicker}>Tags you pick when logging (London, NY, Asia…)</p>
            </div>
          </div>
          <TaggedSessionList
            rows={taggedSessions}
            currency={currency}
            emptyLabel="Add session tags on journal entries to compare how you trade each session."
          />
        </div>
      </div>

      {!compact ? (
        <p className="text-[12px] text-zinc-500">
          <Link href={statsHref} className="font-medium text-[oklch(0.78_0.11_252)] hover:underline">
            Open Patterns in Stats
          </Link>{" "}
          for setup, mistake, and market breakdowns.
        </p>
      ) : null}
    </div>
  );
}
