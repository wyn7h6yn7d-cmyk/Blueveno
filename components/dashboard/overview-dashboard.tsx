"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, BarChart3, BookOpen, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import {
  buildDayAgg,
  computeJournalSummary,
  signedMoney,
} from "@/lib/user-data/journal-metrics";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

const outline = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

export function OverviewDashboard({ userId, email, initialWorkspace }: Props) {
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });

  const dayAgg = useMemo(() => buildDayAgg(data.journal), [data.journal]);
  const summary = useMemo(() => computeJournalSummary(dayAgg), [dayAgg]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="At-a-glance performance and quick paths to calendar, stats, and your journal."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary">
        {!ready ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[7.5rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </>
        ) : (
          [
            { label: "This week P&L", value: signedMoney(summary.weekPnl), tone: summary.weekPnl },
            { label: "This month P&L", value: signedMoney(summary.monthPnl), tone: summary.monthPnl },
            { label: "Win / Loss days", value: summary.winLoss, tone: 0 },
            { label: "Current streak", value: summary.streak, tone: 0 },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(155deg,oklch(0.14_0.028_262/0.96),oklch(0.112_0.026_264/0.95))] p-6 shadow-bv-card ring-1 ring-white/[0.03]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{card.label}</p>
              <p
                className={cn(
                  "font-display mt-3 text-[1.65rem] tabular-nums leading-none tracking-[-0.02em]",
                  card.tone > 0 && "text-emerald-200",
                  card.tone < 0 && "text-rose-200",
                  card.tone === 0 && "text-zinc-50",
                )}
              >
                {card.value}
              </p>
            </div>
          ))
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/app/calendar"
          className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,oklch(0.13_0.04_262/0.92),oklch(0.095_0.035_266/0.96))] p-6 shadow-bv-card ring-1 ring-white/[0.03] transition hover:border-white/[0.14]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Navigate</p>
              <p className="font-display mt-2 text-lg text-zinc-50">Calendar</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
                Month grid, weekly rail, jump to any day.
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition group-hover:text-zinc-100">
              <CalendarDays className="size-5" strokeWidth={1.75} />
            </span>
          </div>
          <span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[oklch(0.78_0.1_250)]">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>

        <Link
          href="/app/stats"
          className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,oklch(0.13_0.04_262/0.92),oklch(0.095_0.035_266/0.96))] p-6 shadow-bv-card ring-1 ring-white/[0.03] transition hover:border-white/[0.14]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Navigate</p>
              <p className="font-display mt-2 text-lg text-zinc-50">Stats</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
                P&amp;L curves, streaks, and monthly rhythm.
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition group-hover:text-zinc-100">
              <BarChart3 className="size-5" strokeWidth={1.75} />
            </span>
          </div>
          <span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[oklch(0.78_0.1_250)]">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>

        <Link
          href="/app/journal"
          className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,oklch(0.13_0.04_262/0.92),oklch(0.095_0.035_266/0.96))] p-6 shadow-bv-card ring-1 ring-white/[0.03] transition hover:border-white/[0.14]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Navigate</p>
              <p className="font-display mt-2 text-lg text-zinc-50">Journal</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
                Log days, notes, and TradingView links.
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition group-hover:text-zinc-100">
              <BookOpen className="size-5" strokeWidth={1.75} />
            </span>
          </div>
          <span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[oklch(0.78_0.1_250)]">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <p className="text-[14px] leading-relaxed text-zinc-500">
          Signed in as <span className="text-zinc-200">{email}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/app/settings/billing" className={outline}>
            Billing &amp; upgrade
          </Link>
        </div>
      </section>
    </div>
  );
}
