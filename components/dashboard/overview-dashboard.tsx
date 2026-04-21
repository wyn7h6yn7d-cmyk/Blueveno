"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, BarChart3, BookOpen, CalendarDays } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { PageHeader } from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { buildDayAgg, computeJournalSummary, signedMoney } from "@/lib/user-data/journal-metrics";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

const surfaceTile =
  "group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(148deg,oklch(0.125_0.038_262/0.94),oklch(0.088_0.032_266/0.96))] p-6 shadow-[0_20px_50px_-36px_rgba(0,0,0,0.75),inset_0_1px_0_0_oklch(1_0_0_/0.05)] ring-1 ring-white/[0.04] transition hover:border-white/[0.14]";

export function OverviewDashboard({ userId, email, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });

  const dayAgg = useMemo(() => buildDayAgg(data.journal), [data.journal]);
  const summary = useMemo(() => computeJournalSummary(dayAgg), [dayAgg]);

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Blueveno"
        title="Overview"
        description="Month snapshot — open the calendar or journal when you are ready."
        actions={
          <Link href="/app/calendar" className={appSecondaryCta}>
            <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Open calendar
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary">
        {!ready ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[7.25rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </>
        ) : (
          [
            { label: "Week", value: signedMoney(summary.weekPnl, displayCurrency), tone: summary.weekPnl },
            { label: "Month", value: signedMoney(summary.monthPnl, displayCurrency), tone: summary.monthPnl },
            { label: "Win · loss days", value: summary.winLoss, tone: 0 },
            { label: "Streak", value: summary.streak, tone: 0 },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(155deg,oklch(0.14_0.03_262/0.96),oklch(0.095_0.028_264/0.95))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] ring-1 ring-white/[0.035]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{card.label}</p>
              <p
                className={cn(
                  "font-display mt-3 text-[1.5rem] tabular-nums leading-none tracking-[-0.03em] sm:text-[1.65rem]",
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
        <Link href="/app/calendar" className={surfaceTile}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Signature</p>
              <p className="font-display mt-2 text-lg text-zinc-50">Calendar</p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                Month grid, weekly totals, and color by outcome.
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-200 transition group-hover:border-white/[0.14]">
              <CalendarDays className="size-5" strokeWidth={1.75} />
            </span>
          </div>
          <span className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[oklch(0.78_0.1_250)]">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>

        <Link href="/app/stats" className={surfaceTile}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Rhythm</p>
              <p className="font-display mt-2 text-lg text-zinc-50">Stats</p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                Curves and streaks — calm, not a terminal.
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-200 transition group-hover:border-white/[0.14]">
              <BarChart3 className="size-5" strokeWidth={1.75} />
            </span>
          </div>
          <span className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[oklch(0.78_0.1_250)]">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>

        <Link href="/app/journal" className={surfaceTile}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Log</p>
              <p className="font-display mt-2 text-lg text-zinc-50">Journal</p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                Day result, note, and optional TradingView link.
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-200 transition group-hover:border-white/[0.14]">
              <BookOpen className="size-5" strokeWidth={1.75} />
            </span>
          </div>
          <span className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[oklch(0.78_0.1_250)]">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <p className="text-[14px] text-zinc-500">
          Signed in as <span className="text-zinc-200">{email}</span>
        </p>
        <div className="mt-3">
          <Link
            href="/app/settings/billing"
            className="inline-flex text-[13px] font-medium text-[oklch(0.78_0.11_252)] underline-offset-4 hover:underline"
          >
            Plan & billing
          </Link>
        </div>
      </section>
    </div>
  );
}
