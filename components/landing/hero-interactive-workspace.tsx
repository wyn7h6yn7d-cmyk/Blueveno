"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
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
  { label: "Expect.", value: "+0.18", accent: false },
  { label: "Win %", value: "54", accent: false },
  { label: "Max DD", value: "−1.2R", accent: false },
];

const fills = [
  { t: "09:44:02", sym: "ESZ5", side: "L", qty: "2", tag: "ORB", r: "+0.50" },
  { t: "10:12:18", sym: "NQZ5", side: "L", qty: "1", tag: "Fade", r: "+0.80" },
  { t: "10:41:55", sym: "ESZ5", side: "S", qty: "1", tag: "VWAP", r: "−0.20" },
  { t: "11:03:40", sym: "ESZ5", side: "L", qty: "2", tag: "ORB", r: "+0.35" },
];

function SessionStrip({ label }: { label: string }) {
  return (
    <div className="relative border-b border-white/[0.12] bg-[linear-gradient(180deg,oklch(0.09_0.03_268/1)_0%,oklch(0.055_0.035_268/1)_100%)] shadow-[inset_0_-1px_0_0_oklch(1_0_0_/0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 md:px-5">
        <span className="text-zinc-400">
          Session <span className="font-semibold tracking-[0.12em] text-zinc-100">{label}</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[8px] tracking-[0.14em] text-zinc-500 sm:inline">Desk · primary · SIM</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/35 bg-emerald-500/[0.12] px-2 py-0.5 text-[8px] font-semibold tracking-[0.14em] text-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_1px_oklch(0.45_0.12_160/0.5)]" aria-hidden />
            Linked
          </span>
        </div>
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
          className={cn(
            "group/kpi cursor-default rounded-xl border bg-bv-surface-inset px-3 py-2.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] transition-[transform,border-color,box-shadow] duration-200",
            k.accent
              ? "border-primary/45 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),inset_0_0_0_1px_oklch(0.55_0.13_252/0.2)]"
              : "border-white/[0.12] hover:-translate-y-px hover:border-white/[0.18] hover:shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)]",
          )}
        >
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-zinc-400">{k.label}</p>
          <p
            className={cn(
              "font-display mt-1 text-xl tabular-nums tracking-tight md:text-2xl",
              k.accent ? "text-primary" : "text-zinc-50",
            )}
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
    <div className="group/chart relative overflow-hidden rounded-xl border border-primary/45 bg-[linear-gradient(165deg,oklch(0.09_0.034_268/1)_0%,oklch(0.062_0.036_268/1)_55%,oklch(0.055_0.038_268/1)_100%)] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.07),inset_0_0_0_1px_oklch(0.55_0.12_252/0.15)] md:h-56">
      <div className="absolute inset-0 bg-grid-fine-sharp opacity-[0.5]" />
      <div className="pointer-events-none absolute left-0 top-0 z-[1] flex h-full w-9 flex-col justify-between border-r border-white/[0.08] bg-black/30 py-2 pl-2 pr-1 font-mono text-[7px] tabular-nums leading-none text-zinc-500">
        <span>+4R</span>
        <span>0</span>
        <span>−2R</span>
      </div>
      <div className="pointer-events-none absolute left-10 right-3 top-3 z-10 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em]">
        <span className="rounded border border-white/[0.14] bg-black/60 px-1.5 py-0.5 font-semibold text-zinc-100">Equity curve</span>
        <span className="text-zinc-500">90 sessions · R-baseline</span>
      </div>
      <svg className="relative ml-9 h-48 w-[calc(100%-2.25rem)] md:h-56" viewBox="0 0 480 176" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="hiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.58 0.14 252 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.52 0.12 252 / 0)" />
          </linearGradient>
          <linearGradient id="hiStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.68 0.13 252)" />
            <stop offset="50%" stopColor="oklch(0.78 0.11 252)" />
            <stop offset="100%" stopColor="oklch(0.65 0.13 250)" />
          </linearGradient>
        </defs>
        {[44, 88, 132].map((y) => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="oklch(1 0 0 / 0.07)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path
          d="M0,132 C48,128 72,108 112,100 C152,92 176,112 216,78 C256,44 280,88 320,52 C360,18 384,72 424,38 C440,26 456,32 480,22 L480,176 L0,176 Z"
          fill="url(#hiFill)"
        />
        <path
          d="M0,132 C48,128 72,108 112,100 C152,92 176,112 216,78 C256,44 280,88 320,52 C360,18 384,72 424,38 C440,26 456,32 480,22"
          fill="none"
          stroke="url(#hiStroke)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="480" cy="22" r="3" fill="oklch(0.72 0.12 252)" stroke="oklch(0.09 0.03 268)" strokeWidth="1" />
      </svg>
      <div className="absolute bottom-2.5 left-10 right-4 flex items-end justify-between gap-4 border-t border-white/[0.1] pt-2 font-mono text-[9px]">
        <span className="text-zinc-500">Baseline · R-multiple</span>
        <span className="font-semibold text-primary">+3.41 R · post-review</span>
      </div>
    </div>
  );
}

function FillsTable({ dense }: { dense?: boolean }) {
  const rows = dense ? fills : fills.slice(0, 3);
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[linear-gradient(180deg,oklch(0.07_0.03_268/1)_0%,oklch(0.055_0.035_268/1)_100%)] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
      <div className="flex items-center justify-between border-b border-white/[0.1] bg-white/[0.05] px-3 py-2">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-300">Session fills</span>
        <span className="font-mono text-[8px] text-zinc-500">EST · tape-synced</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.08] font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-500">
              <th scope="col" className="px-3 py-2 font-medium">
                Time
              </th>
              <th scope="col" className="py-2 font-medium">
                Sym
              </th>
              <th scope="col" className="hidden py-2 font-medium sm:table-cell">
                Side
              </th>
              <th scope="col" className="hidden py-2 font-medium md:table-cell">
                Qty
              </th>
              <th scope="col" className="py-2 font-medium">
                Tag
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                R
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.t + row.sym + row.tag + i}
                className={cn(
                  "border-b border-white/[0.06] transition-colors last:border-0",
                  i % 2 === 0 ? "bg-black/20" : "bg-black/[0.12]",
                  "hover:bg-white/[0.06]",
                )}
              >
                <td className="px-3 py-2 font-mono tabular-nums text-zinc-400">{row.t}</td>
                <td className="py-2 font-semibold text-zinc-100">{row.sym}</td>
                <td className="hidden py-2 font-mono text-zinc-400 sm:table-cell">{row.side}</td>
                <td className="hidden py-2 font-mono tabular-nums text-zinc-500 md:table-cell">{row.qty}</td>
                <td className="py-2">
                  <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">{row.tag}</span>
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right font-mono text-xs tabular-nums font-semibold tracking-tight",
                    row.r.startsWith("−") ? "text-rose-300/95" : "text-zinc-50",
                  )}
                >
                  {row.r}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="rounded-xl border border-white/[0.12] bg-bv-surface-inset p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]">
      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-300">Desk signals</p>
      <ul className="mt-2.5 space-y-2">
        {rows.map((row) => (
          <li
            key={row.k}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.1] bg-black/35 px-2.5 py-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-colors hover:border-primary/35"
          >
            <span className="text-[11px] font-medium text-zinc-200">{row.k}</span>
            <span className={cn("font-mono text-[10px] font-semibold tabular-nums", row.ok ? "text-primary" : "text-amber-200")}>
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
    <div className="flex flex-1 flex-col rounded-xl border border-dashed border-primary/45 bg-bv-void/95 p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] transition-colors hover:border-primary/55">
      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-300">Risk window</p>
      <p className="mt-3 font-display text-2xl tabular-nums font-medium text-zinc-50">0.42 R</p>
      <p className="mt-1 font-mono text-[9px] text-zinc-500">Open exposure vs. daily limit</p>
      <div className="mt-auto pt-4">
        <div className="h-2 overflow-hidden rounded-sm border border-white/[0.06] bg-zinc-900 shadow-inner">
          <div className="h-full w-[42%] rounded-sm bg-gradient-to-r from-bv-blue-deep to-primary" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function ReviewLinkPanel() {
  return (
    <div className="relative rounded-xl border border-white/[0.12] bg-bv-surface-inset p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] md:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <div className="group/shot relative aspect-[4/3] max-h-36 overflow-hidden rounded-lg border border-white/[0.14] bg-gradient-to-br from-zinc-800 to-bv-void shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]">
          <div className="absolute inset-0 bg-grid-fine-sharp opacity-[0.45]" />
          <p className="absolute left-2 top-2 rounded border border-white/[0.1] bg-black/60 px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.15em] text-zinc-200">
            Chart · ES 1m
          </p>
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-[1px] bg-gradient-to-t from-bv-blue-deep to-primary transition-all duration-300 group-hover/shot:brightness-110"
                style={{ height: `${28 + ((i * 17) % 52)}%` }}
              />
            ))}
          </div>
        </div>

        <div className="relative hidden h-24 w-12 shrink-0 md:block" aria-hidden>
          <svg className="absolute inset-0 h-full w-full text-primary/55" viewBox="0 0 48 96" fill="none">
            <path
              d="M4 48 H36 Q44 48 44 56 V88"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 3"
              className="animate-bv-review-link"
            />
            <circle cx="4" cy="48" r="3.5" fill="oklch(0.62 0.13 252)" stroke="oklch(0.08 0.03 268)" strokeWidth="1" />
            <circle cx="44" cy="88" r="3.5" fill="oklch(0.62 0.13 252)" stroke="oklch(0.08 0.03 268)" strokeWidth="1" />
          </svg>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
          <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Linked fill</p>
          <p className="mt-2 font-mono text-[11px] text-zinc-100">
            ES · 09:44 · ORB · <span className="font-semibold text-zinc-50">+0.5 R</span>
          </p>
          <p className="mt-2 text-[10px] leading-snug text-zinc-400">Opens on the print—no orphan frames.</p>
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
    <div className="rounded-xl border border-white/[0.12] bg-bv-surface-inset p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]">
      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-300">Active rules</p>
      <ul className="mt-2.5 space-y-2">
        {rows.map((row) => (
          <li
            key={row.k}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.1] bg-black/35 px-2.5 py-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-colors hover:border-primary/35"
          >
            <span className="text-[11px] font-medium text-zinc-200">{row.k}</span>
            <span className={cn("font-mono text-[10px] font-semibold", row.ok ? "text-primary" : "text-amber-200")}>
              {row.v}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FootprintStrip() {
  const bars = Array.from({ length: 24 }).map((_, i) => {
    const h = 24 + ((i * 17) % 72);
    const hot = i === 17;
    return { h, hot, i };
  });
  return (
    <div className="relative border-t border-white/[0.12] bg-[linear-gradient(180deg,oklch(0.06_0.032_268/1)_0%,oklch(0.045_0.036_268/1)_100%)]">
      <div className="flex items-end justify-between gap-2 px-3 pb-1 pt-2 font-mono text-[7px] uppercase tracking-[0.2em] text-zinc-500">
        <span>Execution footprint</span>
        <span className="text-zinc-600">Last 90m · bid/ask delta</span>
      </div>
      <div className="flex items-end gap-px px-3 pb-3 pt-1">
        <div className="flex h-14 w-full items-end justify-between gap-px rounded-sm border border-white/[0.08] bg-zinc-950/90 px-1.5 py-1 shadow-inner">
          {bars.map(({ h, hot, i }) => (
            <div
              key={i}
              className={cn(
                "flex h-12 min-w-[3px] flex-1 items-end justify-center rounded-[1px]",
                hot ? "ring-1 ring-primary/50" : "",
              )}
            >
              <div
                className={cn(
                  "w-full rounded-[1px] bg-gradient-to-t from-bv-blue-deep via-primary to-bv-cyan-electric/90",
                  hot && "brightness-125",
                )}
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between border-t border-white/[0.06] px-3 py-1.5 font-mono text-[7px] tabular-nums text-zinc-600">
        <span>09:30</span>
        <span className="text-zinc-500">Now</span>
        <span>11:00</span>
      </div>
    </div>
  );
}

function FocalRail({ children }: { children: ReactNode }) {
  return (
    <div className="relative pl-3">
      <div
        className="absolute bottom-1 left-0 top-1 w-px bg-gradient-to-b from-primary/80 via-primary/40 to-transparent"
        aria-hidden
      />
      {children}
    </div>
  );
}

function PanelJournal() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.42]" aria-hidden />
      <SessionStrip label="Mon · NY morning" />
      <div className="p-4 md:p-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-300">Ingest · manual judgment on top</p>
        <div className="mt-4 space-y-4">
          <FillsTable dense />
          <div className="rounded-xl border border-white/[0.12] bg-black/50 px-3 py-2.5 font-mono text-[10px] text-zinc-300 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
            <span className="font-semibold text-zinc-100">Note · </span>
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
      <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.42]" aria-hidden />
      <SessionStrip label="Mon · NY morning" />
      <div className="p-4 md:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-400">Performance</p>
          <span className="font-mono text-[8px] text-zinc-600">NY · R-normalized</span>
        </div>
        <KpiBand />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,11.5rem)]">
          <FocalRail>
            <div className="space-y-3">
              <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-primary/90">Primary · equity</p>
              <EquityChart />
              <FillsTable />
            </div>
          </FocalRail>
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
      <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.42]" aria-hidden />
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
      <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.42]" aria-hidden />
      <SessionStrip label="Rules · live" />
      <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <ActiveRulesCard />
          <RiskWindowCard />
        </div>
        <div className="rounded-xl border border-white/[0.12] bg-black/50 p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-300">Violation log · today</p>
          <ul className="mt-3 space-y-2 text-[11px] text-zinc-200">
            <li className="flex justify-between gap-2 border-b border-white/[0.1] pb-2">
              <span>Size after halt</span>
              <span className="font-mono font-semibold text-amber-200">Flagged</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>News window</span>
              <span className="font-mono font-semibold text-primary">Clear</span>
            </li>
          </ul>
        </div>
      </div>
      <FootprintStrip />
    </div>
  );
}

const panelVariants = {
  initial: (reduce: boolean) => ({ opacity: 0, y: reduce ? 0 : 8 }),
  animate: { opacity: 1, y: 0 },
  exit: (reduce: boolean) => ({ opacity: 0, y: reduce ? 0 : -5 }),
};

export function HeroInteractiveWorkspace() {
  const [tab, setTab] = useState<TabId>("analytics");
  const reduceMotion = useReducedMotion();

  const meta = TABS.find((t) => t.id === tab)!;

  return (
    <div className="relative">
      <div className="mb-4 flex flex-col gap-3 px-0.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-zinc-300">Live workspace</p>
        <span className="w-fit rounded-full border border-white/[0.12] bg-black/55 px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400">
          Interactive preview · read-only
        </span>
      </div>

      <LayoutGroup id="hero-workspace-tabs">
        <nav
          className="mb-3 rounded-xl border border-white/[0.12] bg-zinc-950 p-1 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]"
          aria-label="Workspace areas"
        >
          <div className="relative flex flex-wrap gap-0.5 sm:flex-nowrap">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative min-h-10 flex-1 rounded-lg px-2 py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                    active ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300",
                  )}
                  aria-pressed={active}
                >
                  {active ? (
                    <motion.span
                      layoutId="hero-workspace-tab-active"
                      className="absolute inset-0 rounded-lg bg-[linear-gradient(180deg,oklch(0.16_0.04_262/1)_0%,oklch(0.1_0.035_266/1)_100%)] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.12),inset_0_0_0_1px_oklch(0.58_0.13_252/0.45)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </LayoutGroup>

      <motion.div
        className="transition-shadow duration-300"
        whileHover={reduceMotion ? undefined : { y: -1 }}
        transition={{ type: "spring", stiffness: 460, damping: 38 }}
      >
        <TerminalFrame
          title={meta.frameTitle}
          subtitle={meta.frameSubtitle}
          variant="hero"
          className="rounded-2xl transition-[border-color,box-shadow] duration-300 hover:border-primary/35 hover:shadow-[0_0_0_1px_oklch(0.58_0.12_252/0.28),0_20px_48px_-24px_oklch(0_0_0_/0.85)]"
        >
          <div className="relative min-h-[min(28rem,70vh)]">
            <AnimatePresence initial={false} mode="wait" custom={!!reduceMotion}>
              <motion.div
                key={tab}
                role="tabpanel"
                custom={!!reduceMotion}
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 min-h-full overflow-y-auto overflow-x-hidden"
              >
                {tab === "journal" ? <PanelJournal /> : null}
                {tab === "analytics" ? <PanelAnalytics /> : null}
                {tab === "review" ? <PanelReview /> : null}
                {tab === "rules" ? <PanelRules /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </TerminalFrame>
      </motion.div>
    </div>
  );
}
