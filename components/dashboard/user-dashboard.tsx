"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Link2, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeKpis, cumulativeSeries } from "@/lib/user-data/kpi";
import { EmptyState } from "@/components/app/empty-state";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";

type Props = {
  userId: string;
  email: string;
};

function equityPath(series: number[], w: number, h: number): { line: string; area: string } | null {
  if (series.length < 2) return null;
  const vals = series;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const padX = 12;
  const padY = 14;
  const innerW = w - 2 * padX;
  const innerH = h - 2 * padY;
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = padX + (i / (vals.length - 1)) * innerW;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(" ");
  const last = pts[pts.length - 1];
  const first = pts[0];
  const area = `${line} L ${last[0]},${h - padY} L ${first[0]},${h - padY} Z`;
  return { line, area };
}

export function UserDashboard({ userId, email }: Props) {
  const gid = useId().replace(/:/g, "");
  const { data, ready } = useUserWorkspace(userId);
  const [recapCopied, setRecapCopied] = useState(false);

  const kpis = useMemo(() => computeKpis(data.journal), [data.journal]);
  const series = useMemo(() => cumulativeSeries(data.journal), [data.journal]);
  const paths = useMemo(() => equityPath(series, 480, 160), [series]);

  const lastTwo = data.journal.slice(0, 2);

  const copyRecap = async () => {
    const lines = [
      `Session recap · ${new Date().toLocaleDateString()}`,
      "",
      ...lastTwo.map((j) => `${j.time} · ${j.sym} · ${j.setup} · ${j.r} R · ${j.tag}`),
      data.journal.length === 0 ? "No fills logged yet — add trades from the dashboard." : "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setRecapCopied(true);
      setTimeout(() => setRecapCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const kpiTone = (tone: "positive" | "negative" | "neutral") =>
    cn(
      "mt-2 font-mono text-[11px] tabular-nums",
      tone === "positive" && "text-[oklch(0.78_0.12_250)]",
      tone === "negative" && "text-amber-200/90",
      tone === "neutral" && "text-zinc-500",
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="Your result center: performance summary, calendar P&L, and progression graph."
        actions={
          <Link
            href="/app/journal"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Add day in journal
          </Link>
        }
      />

      <section aria-label="Key metrics">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Net R", value: kpis.netR, delta: kpis.netRDelta, tone: kpis.netRTone },
            { label: "Expectancy", value: kpis.expectancy, delta: kpis.expectancyDelta, tone: kpis.expectancyTone },
            { label: "Win rate", value: kpis.winRate, delta: kpis.winRateDelta, tone: kpis.winRateTone },
            { label: "Max DD", value: kpis.maxDd, delta: kpis.maxDdDelta, tone: kpis.maxDdTone },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-white/[0.07] bg-[oklch(0.11_0.025_265/0.9)] p-4 shadow-bv-card ring-1 ring-white/[0.03]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{k.label}</p>
              <p className="font-display mt-2 text-3xl tabular-nums tracking-tight text-zinc-50">{k.value}</p>
              <p className={kpiTone(k.tone)}>{k.delta}</p>
            </div>
          ))}
        </div>
      </section>

      <DashboardCard
        eyebrow="Calendar view"
        title="Daily and weekly P&L"
        description="Fast scan of green/red days and weekly totals."
      >
        {!ready ? (
          <div className="h-32 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        ) : data.journal.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No trading days yet"
            description="Calendar view activates after your first Journal entry."
            className="border-none bg-transparent py-8"
          />
        ) : (
          <PnlCalendar entries={data.journal} />
        )}
      </DashboardCard>

      <DashboardCard
        eyebrow="Week tracker"
        title="Daily P&L progression"
        description="Only your own entries are visualized here — nothing is seeded."
        variant="inset"
      >
        {data.journal.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No trading days yet"
            description="Start tracking your week by adding your first journal entry. Green and red day trends appear automatically."
            className="border-none bg-transparent py-8"
          />
        ) : (
          <div className="relative h-44 overflow-hidden rounded-xl border border-white/[0.06] bg-[oklch(0.08_0.03_265)] md:h-52">
            <div className="absolute inset-0 bg-grid-fine opacity-25" aria-hidden />
            <svg className="relative h-full w-full" viewBox="0 0 480 160" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id={`${gid}-eq`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.2 250 / 0.35)" />
                  <stop offset="100%" stopColor="oklch(0.55 0.2 250 / 0)" />
                </linearGradient>
                <linearGradient id={`${gid}-ln`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.55 0.18 250)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.12 255)" />
                </linearGradient>
              </defs>
              {paths ? (
                <>
                  <path d={paths.area} fill={`url(#${gid}-eq)`} />
                  <path d={paths.line} fill="none" stroke={`url(#${gid}-ln)`} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
                </>
              ) : null}
            </svg>
            <div className="absolute bottom-3 left-4 max-w-[80%] font-mono text-[9px] leading-relaxed text-zinc-600">
              Cumulative R from your journal
            </div>
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        eyebrow="Day review"
        title="Latest notes"
        description="Quick recap from your most recent entries."
      >
        {lastTwo.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="Add your first journal entry"
            description="After your first entry, your day recap appears here with notes and P&L context."
            className="border-none bg-transparent py-8"
            action={
              <Link
                href="/app/journal#add"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                Open journal
              </Link>
            }
          />
        ) : (
          <>
            <ul className="space-y-3 text-[15px] leading-relaxed text-zinc-300">
              {lastTwo.map((j) => (
                <li key={j.id} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[oklch(0.65_0.14_250)]" />
                  <span>
                    <span className="font-mono text-zinc-500">{j.time}</span> · {j.sym} · {j.setup} ·{" "}
                    <span className="font-mono tabular-nums text-zinc-100">{j.r} R</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-10 w-full rounded-xl border-white/[0.1] bg-transparent text-[15px] text-zinc-200 hover:bg-white/[0.05]"
              onClick={copyRecap}
            >
              {recapCopied ? "Copied" : "Copy recap"}
            </Button>
          </>
        )}
      </DashboardCard>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.03]">
        <p className="text-[15px] leading-relaxed text-zinc-500">
          Signed in as <span className="text-zinc-300">{email}</span>
        </p>
        <Link
          href="/app/journal"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-[oklch(0.78_0.12_250)] hover:underline"
        >
          Open journal
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.03]">
        <p className="text-[15px] leading-relaxed text-zinc-500">
          Data flow: every account has its own empty workspace on first login. We never seed demo trades, metrics, or analytics.
        </p>
      </div>
    </div>
  );
}
