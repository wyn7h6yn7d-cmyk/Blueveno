"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Link2, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeKpis, cumulativeSeries } from "@/lib/user-data/kpi";
import { EmptyState } from "@/components/app/empty-state";
import { isValidTradingViewUrl } from "@/lib/tradingview";

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
  const { data, ready, addRow } = useUserWorkspace(userId);
  const [time, setTime] = useState("");
  const [sym, setSym] = useState("");
  const [setup, setSetup] = useState("");
  const [r, setR] = useState("");
  const [tag, setTag] = useState("");
  const [tradingViewUrl, setTradingViewUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [recapCopied, setRecapCopied] = useState(false);

  const kpis = useMemo(() => computeKpis(data.journal), [data.journal]);
  const series = useMemo(() => cumulativeSeries(data.journal), [data.journal]);
  const paths = useMemo(() => equityPath(series, 480, 160), [series]);

  const lastTwo = data.journal.slice(0, 2);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sym.trim() || !r.trim()) return;
    if (!isValidTradingViewUrl(tradingViewUrl)) {
      setUrlError("Enter a valid TradingView URL.");
      return;
    }
    setUrlError(null);
    const t = time.trim() || new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    addRow({
      time: t,
      sym: sym.trim().toUpperCase(),
      setup: setup.trim() || "—",
      r: r.trim(),
      tag: tag.trim() || "Manual",
      tradingViewUrl: tradingViewUrl.trim() || undefined,
    });
    setSym("");
    setSetup("");
    setR("");
    setTag("");
    setTradingViewUrl("");
    setTime("");
  };

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
        description="Clean by default: every new account starts empty. Add your first trading day and begin tracking this week."
        actions={
          <Link
            href="/app/journal"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Open journal
          </Link>
        }
      />

      <DashboardCard
        eyebrow="Add data"
        title="Log a fill"
        description="Quick entry — appears in Recent and Journal. Use R like +0.5 or −0.25."
        variant="inset"
      >
        {!ready ? (
          <p className="text-sm text-zinc-500">Loading workspace…</p>
        ) : (
          <form onSubmit={onAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="dash-time" className="text-[13px] text-zinc-400">
                Time
              </Label>
              <Input
                id="dash-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder={new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dash-sym" className="text-[13px] text-zinc-400">
                Symbol
              </Label>
              <Input
                id="dash-sym"
                value={sym}
                onChange={(e) => setSym(e.target.value)}
                placeholder="ES"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dash-setup" className="text-[13px] text-zinc-400">
                Setup
              </Label>
              <Input
                id="dash-setup"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                placeholder="ORB · long"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dash-r" className="text-[13px] text-zinc-400">
                R
              </Label>
              <Input
                id="dash-r"
                value={r}
                onChange={(e) => setR(e.target.value)}
                placeholder="+0.5"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 font-mono text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dash-tag" className="text-[13px] text-zinc-400">
                Tag
              </Label>
              <Input
                id="dash-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Clean"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-4">
              <Label htmlFor="dash-tv" className="text-[13px] text-zinc-400">
                TradingView link
              </Label>
              <Input
                id="dash-tv"
                type="url"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="https://www.tradingview.com/chart/..."
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-2">
              <Button
                type="submit"
                className="h-10 w-full rounded-xl bg-[oklch(0.72_0.14_250)] text-[15px] text-[oklch(0.12_0.04_265)] hover:bg-[oklch(0.78_0.12_250)] sm:w-auto sm:px-8"
              >
                Add to journal
              </Button>
            </div>
            {urlError ? <p className="sm:col-span-2 lg:col-span-6 text-sm text-rose-300">{urlError}</p> : null}
          </form>
        )}
      </DashboardCard>

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

      <DashboardCard
        eyebrow="Recent executions"
        title="Latest journal entries"
        description="Newest first — same data as the Journal page."
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-zinc-500">
              Signed in as <span className="text-zinc-300">{email}</span>
            </p>
            <Link
              href="/app/journal"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[oklch(0.78_0.12_250)] hover:underline"
            >
              View all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-bv-surface-inset/80 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                <th scope="col" className="px-4 py-3">
                  Time
                </th>
                <th scope="col" className="px-4 py-3">
                  Symbol
                </th>
                <th scope="col" className="px-4 py-3">
                  Setup
                </th>
                <th scope="col" className="px-4 py-3 text-right tabular-nums">
                  R
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Tag
                </th>
              </tr>
            </thead>
            <tbody>
              {data.journal.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <div className="py-2">
                      <EmptyState
                        icon={Link2}
                        title="Paste your TradingView link"
                        description="Create your first entry in Journal, add your notes, and attach a TradingView chart URL for clear day review."
                        className="border-none bg-transparent py-5"
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                data.journal.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-mono text-sm text-zinc-400">{row.time}</td>
                    <td className="px-4 py-3 font-medium text-zinc-200">{row.sym}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.setup}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-200">{row.r}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                          {row.tag}
                        </span>
                        <Link
                          href={`/app/journal/${row.id}`}
                          className="font-mono text-[10px] text-[oklch(0.8_0.1_248)] hover:underline"
                        >
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.03]">
        <p className="text-[15px] leading-relaxed text-zinc-500">
          Data flow: every account has its own empty workspace on first login. We never seed demo trades, metrics, or analytics.
        </p>
      </div>
    </div>
  );
}
