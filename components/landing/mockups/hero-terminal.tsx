"use client";

import { TerminalFrame } from "./terminal-frame";

export function HeroTerminal() {
  return (
    <TerminalFrame title="blueveno · performance terminal" className="border-glow-subtle">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-40" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.08_0.04_265)]" />

        <div className="relative grid gap-0 p-5 md:grid-cols-[1fr_200px] md:gap-6 md:p-6">
          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Cumulative edge · R
                </p>
                <p className="font-display mt-1 text-4xl font-medium tracking-tight text-zinc-50 md:text-[2.75rem]">
                  +3.41
                  <span className="ml-1.5 text-xl font-normal text-[oklch(0.72_0.14_250)]">R</span>
                </p>
              </div>
              <div className="flex gap-3">
                {[
                  { l: "Expectancy", v: "+0.18" },
                  { l: "Max DD", v: "−1.2 R" },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-right"
                  >
                    <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                      {x.l}
                    </p>
                    <p className="font-mono text-sm tabular-nums text-zinc-200">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-44 overflow-hidden rounded-xl border border-white/[0.06] bg-[oklch(0.07_0.03_265)] md:h-52">
              <div className="absolute inset-0 bg-grid-fine opacity-25" />
              <svg className="relative h-full w-full" viewBox="0 0 480 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroEq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.2 250 / 0.45)" />
                    <stop offset="100%" stopColor="oklch(0.55 0.2 250 / 0)" />
                  </linearGradient>
                  <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 250)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.12 255)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,120 C40,118 60,100 100,95 C140,90 160,105 200,75 C240,45 260,85 300,55 C340,25 360,70 400,40 C420,28 440,35 480,20 L480,160 L0,160 Z"
                  fill="url(#heroEq)"
                />
                <path
                  d="M0,120 C40,118 60,100 100,95 C140,90 160,105 200,75 C240,45 260,85 300,55 C340,25 360,70 400,40 C420,28 440,35 480,20"
                  fill="none"
                  stroke="url(#heroLine)"
                  strokeWidth="1.75"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="absolute bottom-3 left-4 font-mono text-[9px] text-zinc-600">
                90 sessions · rolling equity
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col justify-between border-t border-white/[0.05] pt-4 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Live signals
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { k: "Plan drift", v: "low" },
                  { k: "Review due", v: "2" },
                  { k: "Rule risk", v: "clear" },
                ].map((row) => (
                  <li
                    key={row.k}
                    className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5"
                  >
                    <span className="text-[11px] text-zinc-400">{row.k}</span>
                    <span className="font-mono text-[10px] text-[oklch(0.72_0.12_250)]">{row.v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 font-mono text-[9px] leading-relaxed text-zinc-600">
              Data ingested automatically. Review stays attached to execution.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-t border-white/[0.06] bg-black/30 px-4 py-3">
          {Array.from({ length: 18 }).map((_, i) => {
            const h = 25 + ((i * 17) % 65);
            return (
              <div
                key={i}
                className="flex h-11 w-1.5 items-end justify-center rounded-sm bg-zinc-900/90"
              >
                <div
                  className="w-full rounded-sm bg-gradient-to-t from-[oklch(0.35_0.12_260)] to-[oklch(0.65_0.16_250)]"
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
          <span className="ml-auto self-center font-mono text-[8px] uppercase tracking-wider text-zinc-600">
            Execution footprint
          </span>
        </div>

      </div>
    </TerminalFrame>
  );
}
