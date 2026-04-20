"use client";

import { TerminalFrame } from "./terminal-frame";

const kpis = [
  { label: "Cum R", value: "+3.41", accent: true },
  { label: "Expect.", value: "+0.18" },
  { label: "Win %", value: "54" },
  { label: "Max DD", value: "−1.2R" },
];

const deskRows = [
  { k: "Plan drift", v: "Low", tone: "ok" as const },
  { k: "Review queue", v: "2", tone: "warn" as const },
  { k: "Rule surface", v: "Clear", tone: "ok" as const },
];

const fills = [
  { t: "09:44", sym: "ES", tag: "ORB", r: "+0.5" },
  { t: "10:12", sym: "NQ", tag: "Fade", r: "+0.8" },
];

export function HeroTerminal() {
  return (
    <TerminalFrame title="workspace · performance" variant="hero" className="rounded-3xl">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.42]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/12 via-transparent to-bv-void" />

        {/* Session strip */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-black/25 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 md:px-5">
          <span className="text-zinc-400">
            Session <span className="text-zinc-300">Mon · NY morning</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden text-zinc-600 sm:inline">Desk · primary</span>
            <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-medium tracking-[0.18em] text-emerald-300/95">
              <span className="size-1.5 rounded-full bg-emerald-400/90" aria-hidden />
              In sync
            </span>
          </div>
        </div>

        <div className="p-4 md:p-5">
          {/* KPI band */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-border/80 bg-bv-surface-inset/90 px-3 py-2.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]"
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

          {/* Main workstation grid */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,11.5rem)]">
            <div className="space-y-3">
              <div className="relative h-48 overflow-hidden rounded-xl border border-primary/22 bg-bv-surface-inset shadow-[inset_0_0_0_1px_oklch(1_0_0_/0.04),0_0_40px_-12px_oklch(0.45_0.12_252/0.12)] md:h-56">
                <div className="absolute inset-0 bg-grid-fine opacity-30" />
                <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-500">
                  <span className="rounded border border-white/[0.08] bg-black/40 px-1.5 py-0.5 text-zinc-400">
                    Equity
                  </span>
                  <span>90 sessions · rolling</span>
                </div>
                <svg className="relative h-full w-full" viewBox="0 0 480 176" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.48 0.12 252 / 0.38)" />
                      <stop offset="100%" stopColor="oklch(0.48 0.12 252 / 0)" />
                    </linearGradient>
                    <linearGradient id="heroStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="oklch(0.48 0.12 252)" />
                      <stop offset="55%" stopColor="oklch(0.64 0.12 252)" />
                      <stop offset="100%" stopColor="oklch(0.58 0.13 250)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,132 C48,128 72,108 112,100 C152,92 176,112 216,78 C256,44 280,88 320,52 C360,18 384,72 424,38 C440,26 456,32 480,22 L480,176 L0,176 Z"
                    fill="url(#heroFill)"
                  />
                  <path
                    d="M0,132 C48,128 72,108 112,100 C152,92 176,112 216,78 C256,44 280,88 320,52 C360,18 384,72 424,38 C440,26 456,32 480,22"
                    fill="none"
                    stroke="url(#heroStroke)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4 font-mono text-[9px] text-zinc-600">
                  <span>Baseline · R-multiple</span>
                  <span className="text-primary">+3.41 R · post-review</span>
                </div>
              </div>

              {/* Recent fills */}
              <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
                <div className="border-b border-white/[0.05] bg-white/[0.02] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  Recent fills · tagged
                </div>
                <table className="w-full text-left text-[11px]">
                  <tbody>
                    {fills.map((row) => (
                      <tr key={row.t} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-3 py-2 font-mono text-zinc-500">{row.t}</td>
                        <td className="py-2 font-medium text-zinc-200">{row.sym}</td>
                        <td className="py-2 text-zinc-500">{row.tag}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-zinc-200">{row.r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side stack */}
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-border/80 bg-bv-surface-inset/95 p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Desk signals</p>
                <ul className="mt-2.5 space-y-2">
                  {deskRows.map((row) => (
                    <li
                      key={row.k}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2.5 py-1.5"
                    >
                      <span className="text-[11px] text-zinc-400">{row.k}</span>
                      <span
                        className={`font-mono text-[10px] ${
                          row.tone === "ok"
                            ? "text-primary"
                            : "text-amber-200/95"
                        }`}
                      >
                        {row.v}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-1 flex-col rounded-xl border border-dashed border-primary/25 bg-bv-void/85 p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Risk window</p>
                <p className="mt-3 font-display text-2xl tabular-nums text-zinc-100">0.42 R</p>
                <p className="mt-1 font-mono text-[9px] text-zinc-600">Open exposure vs. daily limit</p>
                <div className="mt-auto pt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full w-[42%] rounded-full bg-gradient-to-r from-bv-blue-deep to-primary"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footprint */}
        <div className="flex flex-wrap gap-1 border-t border-white/[0.07] bg-black/45 px-4 py-3">
          {Array.from({ length: 22 }).map((_, i) => {
            const h = 22 + ((i * 19) % 68);
            return (
              <div
                key={i}
                className="flex h-12 w-1.5 items-end justify-center rounded-sm bg-zinc-900/95"
              >
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
      </div>
    </TerminalFrame>
  );
}
