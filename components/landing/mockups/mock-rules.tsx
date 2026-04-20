import { TerminalFrame } from "./terminal-frame";
import { MockLabel, MockPill, MockTable, MockTd, MockTh } from "./mockup-primitives";

const rules = [
  {
    name: "Max daily loss",
    scope: "Account",
    used: "−0.42R",
    limit: "−1.00R",
    state: "ok" as const,
  },
  {
    name: "News blackout · tier 1",
    scope: "Firm",
    used: "Clear",
    limit: "±30m",
    state: "ok" as const,
  },
  {
    name: "Consistency · min green days",
    scope: "Eval",
    used: "8 / 10",
    limit: "10 / 14",
    state: "warn" as const,
  },
  {
    name: "Max contracts · open risk",
    scope: "Desk",
    used: "4 ES",
    limit: "6 ES",
    state: "ok" as const,
  },
];

export function MockRuleViolations() {
  return (
    <TerminalFrame title="Rules · compliance" subtitle="Firm + desk + eval · evaluated on fill time">
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
          <MockLabel>Live surface</MockLabel>
          <div className="flex items-center gap-2">
            <MockPill tone="ok">0 breaches · 30d</MockPill>
            <span className="font-mono text-[9px] text-zinc-600">Last check · 14:00:02</span>
          </div>
        </div>

        <div className="mt-3">
          <MockTable>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <MockTh>Rule</MockTh>
                  <MockTh>Scope</MockTh>
                  <MockTh className="text-right">Usage</MockTh>
                  <MockTh className="text-right">Limit</MockTh>
                  <MockTh className="text-right">State</MockTh>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.name} className="hover:bg-white/[0.02]">
                    <MockTd className="text-zinc-200">{r.name}</MockTd>
                    <MockTd className="font-mono text-[10px] text-zinc-500">{r.scope}</MockTd>
                    <MockTd mono className="text-right text-zinc-300">
                      {r.used}
                    </MockTd>
                    <MockTd mono className="text-right text-zinc-500">
                      {r.limit}
                    </MockTd>
                    <MockTd className="text-right">
                      {r.state === "ok" ? (
                        <MockPill tone="ok">OK</MockPill>
                      ) : (
                        <MockPill tone="warn">Near</MockPill>
                      )}
                    </MockTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </MockTable>
        </div>

        <div className="mt-3 rounded border border-dashed border-border/50 bg-bv-surface-inset/50 px-2.5 py-2">
          <p className="font-mono text-[9px] leading-relaxed text-zinc-500">
            Breach attempts log to immutable stream · desk review queue opens on hard limit touch.
          </p>
        </div>
      </div>
    </TerminalFrame>
  );
}
