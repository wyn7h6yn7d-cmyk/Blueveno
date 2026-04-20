"use client";

import { useCallback, useRef, useState } from "react";
import { TerminalFrame } from "@/components/landing/mockups/terminal-frame";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "journal",
    label: "Journal",
    frameTitle: "workspace · journal",
    frameSubtitle: "Tagged fills · single ledger",
  },
  {
    id: "analytics",
    label: "Analytics",
    frameTitle: "workspace · analytics",
    frameSubtitle: "R-normalized · 90 sessions",
  },
  {
    id: "review",
    label: "Review",
    frameTitle: "workspace · review",
    frameSubtitle: "Screenshot bound to fill",
  },
  {
    id: "rules",
    label: "Rules",
    frameTitle: "workspace · enforcement",
    frameSubtitle: "Desk constraints · live",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const kpis = [
  { label: "Cum R", value: "+3.41", accent: true },
  { label: "Expect.", value: "+0.18" },
  { label: "Win %", value: "54" },
  { label: "Max DD", value: "−1.2R" },
];

const fills = [
  { t: "09:44", sym: "ES", tag: "ORB", r: "+0.5" },
  { t: "10:12", sym: "NQ", tag: "Fade", r: "+0.8" },
  { t: "10:41", sym: "ES", tag: "VWAP", r: "−0.2" },
];

function SessionStrip({ label }: { label: string }) {
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-black/25 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 md:px-5">
      <span className="text-zinc-400">
        Session <span className="text-zinc-300">{label}</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="hidden text-zinc-600 sm:inline">Desk · primary</span>
        <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-medium tracking-[0.18em] text-emerald-300/95">
          <span className="size-1.5 rounded-full bg-emerald-400/90" aria-hidden />
          Linked
        </span>
      </div>
    </div>
  );
}

function KpiBand({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {kpis.map((k) => (
        <div
          key={k.label}
          className="group/kpi rounded-xl border border-border/80 bg-bv-surface-inset/90 px-3 py-2.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-colors duration-300 hover:border-primary/25 hover:shadow-[inset_0_0_0_1px_oklch(0.52_0.11_252/0.12)]"
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">{k.label}</p>
          <p
            className={`font-display mt-0.5 text-xl tabular-nums tracking-tight md:text-2xl ${
              k.accent ? "text-zinc-50" : "text-zinc-200"
            }`}
          >
            {k.value}
            {k.label === "Win %" ? <span className="text-base font-normal text-zinc-500">%</span> : null}
          </p>
        </div>
      ))}
    </div>
  );
}

function EquityChart() {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-primary/22 bg-bv-surface-inset shadow-[inset_0_0_0_1px_oklch(1_0_0_/0.04),0_0_40px_-12px_oklch(0.45_0.12_252/0.12)] md:h-56">
      <div className="absolute inset-0 bg-grid-fine opacity-30" />
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-500">
        <span className="rounded border border-white/[0.08] bg-black/40 px-1.5 py-0.5 text-zinc-400">Equity</span>
        <span>90 sessions · rolling</span>
      </div>
      <svg className="relative h-full w-full" viewBox="0 0 480 176" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="hiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.48 0.12 252 / 0.38)" />
            <stop offset="100%" stopColor="oklch(0.48 0.12 252 / 0)" />
          </linearGradient>
          <linearGradient id="hiStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.48 0.12 252)" />
            <stop offset="55%" stopColor="oklch(0.64 0.12 252)" />
            <stop offset="100%" stopColor="oklch(0.58 0.13 250)" />
          </linearGradient>
        </defs>
        <path
          d="M0,132 C48,128 72,108 112,100 C152,92 176,112 216,78 C256,44 280,88 320,52 C360,18 384,72 424,38 C440,26 456,32 480,22 L480,176 L0,176 Z"
          fill="url(#hiFill)"
        />
        <path
          d="M0,132 C48,128 72,108 112,100 C152,92 176,112 216,78 C256,44 280,88 320,52 C360,18 384,72 424,38 C440,26 456,32 480,22"
          fill="none"
          stroke="url(#hiStroke)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4 font-mono text-[9px] text-zinc-600">
        <span>Baseline · R-multiple</span>
        <span className="text-primary">+3.41 R · post-review</span>
      </div>
    </div>
  );
}

function FillsTable({ dense }: { dense?: boolean }) {
  const rows = dense ? fills : fills.slice(0, 2);
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
      <div className="border-b border-white/[0.05] bg-white/[0.02] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
        Recent fills · tagged
      </div>
      <table className="w-full text-left text-[11px]">
        <tbody>
          {rows.map((row) => (
            <tr key={row.t + row.sym + row.tag} className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]">
              <td className="px-3 py-2 font-mono text-zinc-500">{row.t}</td>
              <td className="py-2 font-medium text-zinc-200">{row.sym}</td>
              <td className="py-2 text-zinc-500">{row.tag}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-zinc-200">{row.r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeskSignals() {
  const rows = [
    { k: "Plan drift", v: "Low", ok: true },
    { k: "Review queue", v: "2", ok: false },
    { k: "Rule surface", v: "Clear", ok: true },
  ];
  return (
    <div className="rounded-xl border border-border/80 bg-bv-surface-inset/95 p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Desk signals</p>
      <ul className="mt-2.5 space-y-2">
        {rows.map((row) => (
          <li
            key={row.k}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2.5 py-1.5 transition-colors hover:border-primary/15"
          >
            <span className="text-[11px] text-zinc-400">{row.k}</span>
            <span className={cn("font-mono text-[10px]", row.ok ? "text-primary" : "text-amber-200/95")}>
              {row.v}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskWindowCard() {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-dashed border-primary/25 bg-bv-void/85 p-3 transition-colors hover:border-primary/35">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Risk window</p>
      <p className="mt-3 font-display text-2xl tabular-nums text-zinc-100">0.42 R</p>
      <p className="mt-1 font-mono text-[9px] text-zinc-600">Open exposure vs. daily limit</p>
      <div className="mt-auto pt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-bv-blue-deep to-primary" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function ReviewLinkPanel() {
  return (
    <div className="relative rounded-xl border border-primary/20 bg-bv-surface-inset/90 p-4 md:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <div className="group/shot relative aspect-[4/3] max-h-36 overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-br from-zinc-800/90 to-bv-void">
          <div className="absolute inset-0 bg-grid-fine opacity-40" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/15 to-transparent" />
          <p className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-400">
            Chart · ES 1m
          </p>
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-sm bg-gradient-to-t from-bv-blue-deep/60 to-primary/50 transition-all duration-500 group-hover/shot:from-primary/50"
                style={{ height: `${28 + ((i * 17) % 52)}%` }}
              />
            ))}
          </div>
        </div>

        <div className="relative hidden h-24 w-12 shrink-0 md:block" aria-hidden>
          <svg className="absolute inset-0 h-full w-full text-primary/45" viewBox="0 0 48 96" fill="none">
            <path
              d="M4 48 H36 Q44 48 44 56 V88"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 3"
              className="animate-bv-review-link"
            />
            <circle cx="4" cy="48" r="3" fill="oklch(0.55 0.12 252)" />
            <circle cx="44" cy="88" r="3" fill="oklch(0.55 0.12 252)" />
          </svg>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-emerald-400/90">Linked fill</p>
          <p className="mt-2 font-mono text-[11px] text-zinc-200">
            ES · 09:44 · ORB · <span className="text-zinc-100">+0.5 R</span>
          </p>
          <p className="mt-2 text-[10px] leading-snug text-zinc-500">Screenshot opens on the print—no orphan frames.</p>
        </div>
      </div>
    </div>
  );
}

function ActiveRulesCard() {
  const rows = [
    { k: "Max loss / day", v: "−1.0 R", ok: true },
    { k: "Blackout", v: "12:00–12:30", ok: false },
    { k: "Size cap", v: "3 lots", ok: true },
  ];
  return (
    <div className="rounded-xl border border-border/80 bg-bv-surface-inset/95 p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Active rules</p>
      <ul className="mt-2.5 space-y-2">
        {rows.map((row) => (
          <li
            key={row.k}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2.5 py-1.5 transition-colors hover:border-primary/20"
          >
            <span className="text-[11px] text-zinc-400">{row.k}</span>
            <span className={cn("font-mono text-[10px]", row.ok ? "text-primary" : "text-amber-200/95")}>
              {row.v}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FootprintStrip() {
  return (
    <div className="flex flex-wrap gap-1 border-t border-white/[0.07] bg-black/45 px-4 py-3">
      {Array.from({ length: 22 }).map((_, i) => {
        const h = 22 + ((i * 19) % 68);
        return (
          <div key={i} className="flex h-12 w-1.5 items-end justify-center rounded-sm bg-zinc-900/95">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-bv-blue-deep via-primary to-bv-cyan-electric/85"
              style={{ height: `${h}%` }}
            />
          </div>
        );
      })}
      <span className="ml-auto self-center font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">
        Execution footprint · session
      </span>
    </div>
  );
}

function PanelJournal() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.35]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-bv-void" aria-hidden />
      <SessionStrip label="Mon · NY morning" />
      <div className="p-4 md:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Ingest · manual judgment on top</p>
        <div className="mt-4 space-y-4">
          <FillsTable dense />
          <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5 font-mono text-[10px] text-zinc-500">
            <span className="text-zinc-400">Note · </span>
            Size respected after first stop.
          </div>
        </div>
      </div>
      <FootprintStrip />
    </div>
  );
}

function PanelAnalytics() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.35]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-bv-void" aria-hidden />
      <SessionStrip label="Mon · NY morning" />
      <div className="p-4 md:p-5">
        <KpiBand />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,11.5rem)]">
          <div className="space-y-3">
            <EquityChart />
            <FillsTable />
          </div>
          <div className="flex flex-col gap-3">
            <DeskSignals />
            <RiskWindowCard />
          </div>
        </div>
      </div>
      <FootprintStrip />
    </div>
  );
}

function PanelReview() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.35]" aria-hidden />
      <SessionStrip label="Review · post-close" />
      <div className="space-y-4 p-4 md:p-5">
        <ReviewLinkPanel />
        <FillsTable />
      </div>
      <FootprintStrip />
    </div>
  );
}

function PanelRules() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.35]" aria-hidden />
      <SessionStrip label="Rules · live" />
      <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <ActiveRulesCard />
          <RiskWindowCard />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Violation log · today</p>
          <ul className="mt-3 space-y-2 text-[11px] text-zinc-400">
            <li className="flex justify-between gap-2 border-b border-white/[0.04] pb-2">
              <span>Size after halt</span>
              <span className="font-mono text-amber-200/90">Flagged</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>News window</span>
              <span className="font-mono text-primary">Clear</span>
            </li>
          </ul>
        </div>
      </div>
      <FootprintStrip />
    </div>
  );
}

export function HeroInteractiveWorkspace() {
  const [tab, setTab] = useState<TabId>("analytics");
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--hx", `${x}%`);
    el.style.setProperty("--hy", `${y}%`);
  }, []);

  const onLeave = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--hx", "52%");
    el.style.setProperty("--hy", "38%");
  }, []);

  const meta = TABS.find((t) => t.id === tab)!;

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        {
          ["--hx" as string]: "52%",
          ["--hy" as string]: "38%",
        } as React.CSSProperties
      }
      className="relative"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.25rem] opacity-90 blur-2xl motion-reduce:opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at var(--hx) var(--hy), oklch(0.42 0.11 252 / 0.14), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 -z-[5] rounded-[1.75rem] opacity-70 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(ellipse 38% 32% at var(--hx) var(--hy), oklch(0.5 0.1 252 / 0.07), transparent 55%)",
        }}
      />

      <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">Live workspace</p>
        <span className="w-fit rounded-full border border-border/60 bg-bv-surface-inset/80 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-500">
          Interactive preview · read-only
        </span>
      </div>

      <nav
        className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-white/[0.06] bg-black/25 p-1.5 backdrop-blur-sm"
        aria-label="Workspace areas"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative min-h-10 flex-1 rounded-xl px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "bg-bv-surface/95 text-bv-ice shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06),0_0_0_1px_oklch(0.52_0.11_252/0.2)]"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
              )}
              aria-pressed={active}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="origin-top [transform:perspective(1500px)_rotateX(1.5deg)] lg:scale-[1.01]">
        <TerminalFrame title={meta.frameTitle} subtitle={meta.frameSubtitle} variant="hero" className="rounded-3xl">
          <div className="relative min-h-[min(28rem,70vh)]">
            <div
              className={cn(
                tab === "journal" ? "relative z-10 opacity-100" : "pointer-events-none absolute inset-0 z-0 opacity-0",
                "transition-opacity duration-300 motion-reduce:transition-none",
              )}
            >
              <PanelJournal />
            </div>
            <div
              className={cn(
                tab === "analytics" ? "relative z-10 opacity-100" : "pointer-events-none absolute inset-0 z-0 opacity-0",
                "transition-opacity duration-300 motion-reduce:transition-none",
              )}
            >
              <PanelAnalytics />
            </div>
            <div
              className={cn(
                tab === "review" ? "relative z-10 opacity-100" : "pointer-events-none absolute inset-0 z-0 opacity-0",
                "transition-opacity duration-300 motion-reduce:transition-none",
              )}
            >
              <PanelReview />
            </div>
            <div
              className={cn(
                tab === "rules" ? "relative z-10 opacity-100" : "pointer-events-none absolute inset-0 z-0 opacity-0",
                "transition-opacity duration-300 motion-reduce:transition-none",
              )}
            >
              <PanelRules />
            </div>
          </div>
        </TerminalFrame>
      </div>
    </div>
  );
}
