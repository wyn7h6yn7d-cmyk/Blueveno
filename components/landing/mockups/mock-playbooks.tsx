import { TerminalFrame } from "./terminal-frame";
import { MockLabel, MockPill, MockSparkline } from "./mockup-primitives";

const conditions = [
  { met: true, w: "0.25", text: "Opening range defined · first 15m" },
  { met: true, w: "0.20", text: "Drive holds above prior day VWAP" },
  { met: true, w: "0.20", text: "First pullback ≤ 38% of impulse" },
  { met: false, w: "0.20", text: "No tier-1 macro inside 25m window" },
  { met: true, w: "0.15", text: "Size capped at playbook max" },
];

export function MockPlaybooks() {
  return (
    <TerminalFrame
      title="Playbooks · setup conditions"
      subtitle="ORB · ES · prop account A · eval window 42d"
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-3">
          <div>
            <MockLabel>Active playbook</MockLabel>
            <p className="mt-1 font-display text-lg tracking-tight text-zinc-100">Opening drive · continuation</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">
              When all required pass · scale 1→2 per ladder · else flat
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase text-zinc-600">Adherence · 20 sessions</p>
            <p className="font-display text-2xl tabular-nums text-zinc-50">78%</p>
            <MockPill tone="warn">1 gate missed</MockPill>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <MockLabel>Condition stack · weighted</MockLabel>
            <span className="font-mono text-[9px] tabular-nums text-zinc-500">
              Score <span className="text-zinc-300">0.80</span> / 1.00
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-bv-blue-deep to-primary" />
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {conditions.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-bv-surface-inset/60 px-2.5 py-2"
            >
              <span
                className={
                  c.met
                    ? "mt-0.5 font-mono text-[10px] text-emerald-400/90"
                    : "mt-0.5 font-mono text-[10px] text-zinc-600"
                }
              >
                {c.met ? "✓" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-snug text-zinc-300">{c.text}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-500">{c.w}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-lg border border-border/60 bg-black/25 p-3">
          <div className="flex items-center justify-between">
            <MockLabel>R when full vs partial</MockLabel>
            <span className="font-mono text-[9px] text-zinc-500">Last 30d</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase text-zinc-600">Full stack</p>
              <p className="font-display text-xl tabular-nums text-zinc-100">+0.42</p>
              <p className="font-mono text-[8px] text-zinc-600">n = 28</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase text-zinc-600">Partial</p>
              <p className="font-display text-xl tabular-nums text-zinc-400">+0.09</p>
              <p className="font-mono text-[8px] text-zinc-600">n = 14</p>
            </div>
            <div className="min-w-0 flex-1 pt-2">
              <MockSparkline />
            </div>
          </div>
        </div>
      </div>
    </TerminalFrame>
  );
}
