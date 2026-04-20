import { TerminalFrame } from "./terminal-frame";
import { MockLabel, MockPill } from "./mockup-primitives";

export function MockSessionRecap() {
  return (
    <TerminalFrame title="Recap · session export" subtitle="SR-2025-10-14-NY · PDF · CSV · signed">
      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-border/60 bg-bv-surface-inset/70 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <MockLabel>Session</MockLabel>
              <p className="mt-1 font-display text-base text-zinc-100">Mon · Oct 14 · NY morning</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">06:30–11:15 CT · 6 fills · 1 scratch</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase text-zinc-600">Net</p>
              <p className="font-display text-2xl tabular-nums text-zinc-50">+2.12 R</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Gross R", "+2.36"],
              ["Fees", "−0.24"],
              ["Max adv.", "+0.9R"],
              ["Max adv. seq.", "3"],
            ].map(([k, v]) => (
              <div key={k} className="rounded border border-border/40 bg-black/25 px-2 py-1.5">
                <p className="font-mono text-[8px] uppercase text-zinc-600">{k}</p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-zinc-200">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <MockLabel>Summary</MockLabel>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-zinc-400">
              <li className="flex gap-2">
                <span className="text-zinc-600">—</span>
                Two clean ORB sequences; size respected on adds.
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-600">—</span>
                One discretionary add outside playbook (−0.12R) before noon.
              </li>
              <li className="flex gap-2">
                <span className="text-zinc-600">—</span>
                No rule breaches · impulse tags on 1 decision.
              </li>
            </ul>
          </div>

          <div>
            <MockLabel>Next session · enforcement</MockLabel>
            <div className="mt-2 space-y-2">
              {[
                "Cap adds at 1 until first target partials.",
                "No fade entries during tier-1 macro ±25m.",
                "Screenshot ORB second add before scale.",
              ].map((line) => (
                <div
                  key={line}
                  className="flex items-start gap-2 rounded border border-border/40 bg-white/[0.02] px-2.5 py-1.5"
                >
                  <span className="mt-0.5 font-mono text-[9px] text-primary/80">□</span>
                  <span className="text-[11px] text-zinc-300">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
          <div className="flex flex-wrap gap-1.5">
            <MockPill tone="neutral">Export PDF</MockPill>
            <MockPill tone="neutral">CSV</MockPill>
            <MockPill tone="ok">Audit hash</MockPill>
          </div>
          <p className="font-mono text-[8px] text-zinc-600">Template v3.2 · includes rule snapshot</p>
        </div>
      </div>
    </TerminalFrame>
  );
}
