import { TerminalFrame } from "./terminal-frame";
import { MockKpiCell, MockLabel, MockPill, MockTable, MockTd, MockTh } from "./mockup-primitives";

const patterns = [
  { name: "Size-up before confirmation", rate: "12%", trend: "−3% w/w", flag: "watch" as const },
  { name: "Re-entry without written plan", rate: "7%", trend: "flat", flag: "neutral" as const },
  { name: "Early stop nudge (discretion)", rate: "4%", trend: "−1% w/w", flag: "ok" as const },
];

export function MockBehavior() {
  return (
    <TerminalFrame title="Behavior · impulses" subtitle="Rolling 12 weeks · vs prior 12w baseline">
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2">
          <MockKpiCell
            label="Impulse rate"
            value="9.2%"
            hint="of decisions · −2.1% vs prior"
            accent
          />
          <MockKpiCell label="Avg cost · impulse" value="−0.14R" hint="when tagged" />
          <MockKpiCell label="Recovery half-life" value="4.1d" hint="to baseline" />
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-bv-surface-inset/70 p-3">
          <div className="flex items-center justify-between">
            <MockLabel>Weekly impulse share</MockLabel>
            <span className="font-mono text-[8px] text-zinc-600">% of session decisions</span>
          </div>
          <div className="mt-3 flex h-16 items-end gap-1">
            {[14, 18, 11, 22, 16, 19, 12, 15, 9, 14].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[1px] bg-gradient-to-t from-zinc-800 to-primary/75"
                style={{ height: `${h * 4}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[7px] text-zinc-600">
            <span>W1</span>
            <span>W5</span>
            <span>W10</span>
          </div>
        </div>

        <div className="mt-4">
          <MockLabel className="mb-1.5">Flagged patterns · ranked</MockLabel>
          <MockTable>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <MockTh>Pattern</MockTh>
                  <MockTh className="text-right">Rate</MockTh>
                  <MockTh className="text-right">Δ</MockTh>
                  <MockTh className="text-right">State</MockTh>
                </tr>
              </thead>
              <tbody>
                {patterns.map((p) => (
                  <tr key={p.name} className="hover:bg-white/[0.02]">
                    <MockTd className="max-w-[11rem] text-zinc-300">{p.name}</MockTd>
                    <MockTd mono className="text-right">
                      {p.rate}
                    </MockTd>
                    <MockTd mono className="text-right text-zinc-500">
                      {p.trend}
                    </MockTd>
                    <MockTd className="text-right">
                      {p.flag === "watch" ? (
                        <MockPill tone="warn">Watch</MockPill>
                      ) : p.flag === "ok" ? (
                        <MockPill tone="ok">Stable</MockPill>
                      ) : (
                        <MockPill tone="neutral">—</MockPill>
                      )}
                    </MockTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </MockTable>
        </div>

        <p className="mt-3 font-mono text-[9px] leading-relaxed text-zinc-600">
          Labels attach at decision time—backtests use the same taxonomy as forward review.
        </p>
      </div>
    </TerminalFrame>
  );
}
