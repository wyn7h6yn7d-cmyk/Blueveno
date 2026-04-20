import { auth } from "@/auth";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PanelGrid, Panel } from "@/components/app/panel-grid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bars = [38, 52, 44, 61, 48, 70, 55, 63, 42, 58, 49, 66];

export default async function AnalyticsPage() {
  await auth();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Performance"
        description="Expectancy, distributions, and regime slices—built on the same normalized record as your journal."
        actions={
          <Link
            href="/app/journal"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Source data
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { k: "Expectancy", v: "+0.18", sub: "R / trade" },
          { k: "Profit factor", v: "1.42", sub: "Gross win ÷ loss" },
          { k: "Avg win / loss", v: "0.82 / 0.54", sub: "R units" },
          { k: "Best session", v: "+4.2 R", sub: "Last 30d" },
        ].map((x) => (
          <div
            key={x.k}
            className="rounded-xl border border-white/[0.07] bg-[oklch(0.11_0.025_265/0.9)] p-4 shadow-bv-card"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{x.k}</p>
            <p className="font-display mt-2 text-2xl tabular-nums text-zinc-50">{x.v}</p>
            <p className="mt-2 font-mono text-[11px] text-zinc-600">{x.sub}</p>
          </div>
        ))}
      </div>

      <PanelGrid>
        <Panel span={7}>
          <DashboardCard
            eyebrow="Distribution"
            title="R-multiple histogram"
            description="Tagged trades · last 90 sessions"
            variant="inset"
          >
            <div className="flex h-40 items-end gap-1.5 px-1">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-[oklch(0.32_0.1_260)] to-[oklch(0.62_0.14_250)]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] text-zinc-600">
              Tail risk visible early—no smoothing across regimes.
            </p>
          </DashboardCard>
        </Panel>
        <Panel span={5}>
          <DashboardCard eyebrow="Regime" title="Opening vs midday" description="Conditional expectancy">
            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
                <dt className="text-zinc-500">Open drive</dt>
                <dd className="font-mono tabular-nums text-zinc-100">+0.24 R</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
                <dt className="text-zinc-500">Midday</dt>
                <dd className="font-mono tabular-nums text-zinc-100">+0.06 R</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Afternoon</dt>
                <dd className="font-mono tabular-nums text-zinc-400">−0.02 R</dd>
              </div>
            </dl>
            <Link
              href="/app/playbooks"
              className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] text-[oklch(0.78_0.12_250)] hover:underline"
            >
              Tie to playbooks
              <ArrowUpRight className="size-3.5" />
            </Link>
          </DashboardCard>
        </Panel>
      </PanelGrid>

      <DashboardCard
        eyebrow="Streaks"
        title="Discipline signals"
        description="Consecutive plan-adherent sessions — placeholder metrics."
        footer={
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            Test period — full analytics preview
          </p>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Green days", value: "9", hint: "Last 20 sessions" },
            { label: "Rule breaks", value: "2", hint: "Rolling 30d" },
            { label: "Review latency", value: "18m", hint: "Avg post-close" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{s.label}</p>
              <p className="font-display mt-2 text-2xl tabular-nums text-zinc-50">{s.value}</p>
              <p className="mt-1 text-xs text-zinc-600">{s.hint}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
