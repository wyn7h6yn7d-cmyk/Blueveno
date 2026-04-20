import { auth } from "@/auth";
import { hasFeature } from "@/lib/billing/entitlements";
import { UpgradeCta } from "@/components/billing/upgrade-cta";
import Link from "next/link";
import { ArrowUpRight, Activity } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PanelGrid, Panel } from "@/components/app/panel-grid";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AccountTrackingPanel } from "@/components/dashboard/account-tracking-panel";
import { RuleViolationTracker } from "@/components/dashboard/rule-violation-tracker";

const kpis = [
  { label: "Net R (30d)", value: "+12.4", delta: "+2.1 vs prior", tone: "positive" as const },
  { label: "Expectancy", value: "+0.18", delta: "R per trade", tone: "neutral" as const },
  { label: "Win rate", value: "54%", delta: "Tagged fills", tone: "neutral" as const },
  { label: "Max DD", value: "−1.8 R", delta: "Rolling 60d", tone: "negative" as const },
];

const recent = [
  { t: "09:44", sym: "ES", setup: "ORB · long", r: "+0.5", tag: "Clean" },
  { t: "10:12", sym: "NQ", setup: "Fade · short", r: "+0.8", tag: "Plan" },
  { t: "11:03", sym: "ES", setup: "Scratch", r: "−0.1", tag: "Impulse" },
];

export default async function AppHomePage() {
  const session = await auth();
  const showEliteUpsell = !hasFeature(session, "ai.insights");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="Performance snapshot for your connected accounts. Live broker feeds will appear here once ingestion is enabled."
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

      <section aria-label="Key metrics">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-white/[0.07] bg-[oklch(0.11_0.025_265/0.9)] p-4 shadow-bv-card"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{k.label}</p>
              <p className="font-display mt-2 text-3xl tabular-nums tracking-tight text-zinc-50">{k.value}</p>
              <p
                className={cn(
                  "mt-2 font-mono text-[11px] tabular-nums",
                  k.tone === "positive" && "text-[oklch(0.78_0.12_250)]",
                  k.tone === "negative" && "text-amber-200/90",
                  k.tone === "neutral" && "text-zinc-500",
                )}
              >
                {k.delta}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PanelGrid>
        <Panel span={8}>
          <DashboardCard
            eyebrow="Equity curve"
            title="Rolling 90 sessions"
            description="Sample curve—your equity series will appear here after you connect accounts."
            variant="inset"
            footer={
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Last update · 2m ago
                </p>
                <Link
                  href="/app/analytics"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[oklch(0.78_0.12_250)] hover:underline"
                >
                  Analytics
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            }
          >
            <div className="relative h-44 overflow-hidden rounded-lg border border-white/[0.06] bg-[oklch(0.08_0.03_265)] md:h-52">
              <div className="absolute inset-0 bg-grid-fine opacity-25" aria-hidden />
              <svg className="relative h-full w-full" viewBox="0 0 480 160" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="ovEq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.2 250 / 0.35)" />
                    <stop offset="100%" stopColor="oklch(0.55 0.2 250 / 0)" />
                  </linearGradient>
                  <linearGradient id="ovLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 250)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.12 255)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,120 C40,118 60,100 100,95 C140,90 160,105 200,75 C240,45 260,85 300,55 C340,25 360,70 400,40 C420,28 440,35 480,20 L480,160 L0,160 Z"
                  fill="url(#ovEq)"
                />
                <path
                  d="M0,120 C40,118 60,100 100,95 C140,90 160,105 200,75 C240,45 260,85 300,55 C340,25 360,70 400,40 C420,28 440,35 480,20"
                  fill="none"
                  stroke="url(#ovLine)"
                  strokeWidth="1.75"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="absolute bottom-3 left-4 font-mono text-[9px] text-zinc-600">
                90 sessions · rolling equity
              </div>
            </div>
          </DashboardCard>
        </Panel>

        <Panel span={4}>
          <DashboardCard
            eyebrow="Session recap"
            title="Today"
            description="Structured summary — what held, what broke."
          >
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.65_0.14_250)]" />
                Two clean sequences; impulse add flagged once.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-600" />
                Edge concentrated first hour — afternoon flat.
              </li>
            </ul>
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-9 w-full rounded-xl border-white/[0.1] bg-transparent text-zinc-200 hover:bg-white/[0.05]"
              disabled
            >
              Export recap
            </Button>
            <p className="mt-2 text-center font-mono text-[10px] text-zinc-600">Ships with Pro</p>
          </DashboardCard>
        </Panel>
      </PanelGrid>

      <section aria-label="Risk and accounts">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
          Operational view
        </p>
        <PanelGrid>
          <Panel span={6}>
            <RuleViolationTracker />
          </Panel>
          <Panel span={6}>
            <AccountTrackingPanel />
          </Panel>
        </PanelGrid>
      </section>

      <DashboardCard
        eyebrow="Recent executions"
        title="Latest journal entries"
        description="Sample trades—your executions will stream here after you connect a feed."
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              Signed in as <span className="text-zinc-300">{session?.user?.email}</span>
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
        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full min-w-[520px] text-left text-sm">
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
              {recent.map((row) => (
                <tr
                  key={`${row.t}-${row.sym}`}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.t}</td>
                  <td className="px-4 py-3 font-medium text-zinc-200">{row.sym}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.setup}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-200">{row.r}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      {row.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {showEliteUpsell ? <UpgradeCta feature="ai.insights" /> : null}

      <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <Activity className="mt-0.5 size-4 shrink-0 text-[oklch(0.65_0.12_250)]" strokeWidth={1.75} />
        <p className="text-xs leading-relaxed text-zinc-500">
          Only signed-in users can open <code className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">/app/*</code>{" "}
          routes. Broker and prop connections arrive when ingestion is enabled.
        </p>
      </div>
    </div>
  );
}
