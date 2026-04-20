"use client";

import { MockupFrame } from "./MockupFrame";

const bars = [40, 62, 35, 78, 52, 88, 44, 71, 58, 92, 48, 81];

export function HeroDashboard() {
  return (
    <MockupFrame label="blueveno · session overview" className="glow-line">
      <div className="grid gap-0 md:grid-cols-[1fr_220px]">
        <div className="border-b border-white/[0.06] p-5 md:border-b-0 md:border-r">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Net performance · R
              </p>
              <p className="font-display mt-1 text-3xl font-medium tracking-tight text-zinc-100">
                +2.84{" "}
                <span className="text-lg font-normal text-emerald-400/90">R</span>
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-right">
              <p className="font-mono text-[10px] text-zinc-500">Win rate</p>
              <p className="font-mono text-sm text-zinc-200">54.2%</p>
            </div>
          </div>
          <div className="relative h-36 overflow-hidden rounded-xl border border-white/[0.06] bg-[#05060a]">
            <div
              aria-hidden
              className="absolute inset-0 bg-grid opacity-30"
            />
            <svg
              className="relative h-full w-full"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(94,234,212,0.35)" />
                  <stop offset="100%" stopColor="rgba(94,234,212,0)" />
                </linearGradient>
              </defs>
              <path
                d="M0,90 C40,85 60,95 100,70 C140,45 160,80 200,55 C240,30 260,65 300,40 C340,15 360,50 400,25 L400,120 L0,120 Z"
                fill="url(#eq)"
              />
              <path
                d="M0,90 C40,85 60,95 100,70 C140,45 160,80 200,55 C240,30 260,65 300,40 C340,15 360,50 400,25"
                fill="none"
                stroke="rgba(94,234,212,0.85)"
                strokeWidth="1.5"
              />
            </svg>
            <div className="absolute bottom-2 left-3 font-mono text-[9px] text-zinc-600">
              Last 30 sessions · equity curve
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Behavior signals
          </p>
          <ul className="mt-3 space-y-2.5">
            {[
              { k: "Revenge trades", v: "−0.6 R" },
              { k: "Late entries", v: "12%" },
              { k: "Plan adherence", v: "81%" },
            ].map((row) => (
              <li
                key={row.k}
                className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
              >
                <span className="text-xs text-zinc-400">{row.k}</span>
                <span className="font-mono text-xs text-teal-300/90">{row.v}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="mt-3 font-mono text-[9px] leading-relaxed text-zinc-600">
            Tagging engine attributes fills to strategies automatically. Review the
            screenshot trail when the tape gets noisy.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] bg-black/20 px-4 py-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex h-10 w-2 items-end justify-center rounded-sm bg-zinc-900/80"
          >
            <div
              className="w-full rounded-sm bg-gradient-to-t from-teal-600/20 to-teal-300/70"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
        <span className="ml-auto self-center font-mono text-[9px] text-zinc-600">
          Volume-at-time · execution quality
        </span>
      </div>
    </MockupFrame>
  );
}
