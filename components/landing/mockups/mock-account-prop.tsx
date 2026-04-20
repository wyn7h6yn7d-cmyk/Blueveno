import { TerminalFrame } from "./terminal-frame";
import { MockKpiCell, MockLabel, MockPill } from "./mockup-primitives";

export function MockAccountProp() {
  return (
    <TerminalFrame
      title="Accounts · prop evaluation"
      subtitle="Apex Eval · ES · 50k · cycle ends Nov 03"
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div>
            <MockLabel>Account</MockLabel>
            <p className="mt-0.5 font-mono text-xs text-zinc-300">EV-50K-01482 · eval window</p>
          </div>
          <MockPill tone="ok">Within rules</MockPill>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <MockKpiCell label="Drawdown buffer" value="38%" hint="to soft halt" accent />
          <MockKpiCell label="Trailing DD" value="2.1R" hint="vs 5.0R max" />
          <MockKpiCell label="Profit days" value="8" hint="need 10 / 14" />
          <MockKpiCell label="Payout lockout" value="Off" hint="next window Dec 01" />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-bv-surface-inset/80 p-3">
            <MockLabel>Trailing drawdown gauge</MockLabel>
            <div className="mt-3">
              <div className="flex justify-between font-mono text-[9px] text-zinc-500">
                <span>0</span>
                <span>5.0R max</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full w-[42%] rounded-full bg-gradient-to-r from-emerald-600/80 to-primary/90"
                />
              </div>
              <p className="mt-1.5 font-mono text-[9px] text-zinc-600">2.1R consumed · 2.9R headroom</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-bv-surface-inset/80 p-3">
            <MockLabel>Minimum profit calendar</MockLabel>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center font-mono text-[8px]">
              {["M", "T", "W", "T", "F", "M", "T"].map((d, i) => (
                <span key={i} className="text-zinc-600">
                  {d}
                </span>
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const green = [0, 1, 3, 4, 6, 8, 9, 11].includes(i);
                return (
                  <div
                    key={i}
                    className={
                      green
                        ? "rounded-sm bg-emerald-500/25 py-1 text-emerald-300/90"
                        : "rounded-sm bg-zinc-800/80 py-1 text-zinc-600"
                    }
                  >
                    {green ? "●" : "·"}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[9px] text-zinc-600">Green = profit day · 8 / 10 required</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-lg border border-border/50 bg-black/20 p-2.5">
          {[
            ["Payout eligibility", "Dec 01 onward", "synced"],
            ["Overnight hold", "Not allowed", "enforced"],
            ["Scaling ladder", "Playbook only", "ok"],
          ].map(([a, b, c]) => (
            <div key={a} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-zinc-400">{a}</span>
              <span className="font-mono text-[10px] text-zinc-300">{b}</span>
              <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </TerminalFrame>
  );
}
