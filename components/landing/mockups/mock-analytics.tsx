import { TerminalFrame } from "./terminal-frame";
import { MockKpiCell, MockLabel, MockSparkline, MockTable, MockTd, MockTh } from "./mockup-primitives";

const kpis = [
  { label: "Net R (90d)", value: "+14.82", hint: "vs +11.4 prior", accent: true },
  { label: "Expectancy", value: "+0.21", hint: "R / trade", accent: false },
  { label: "Win rate", value: "52.4%", hint: "n = 218", accent: false },
  { label: "Profit factor", value: "1.86", hint: "gross win / loss", accent: false },
];

const bySetup = [
  { setup: "ORB · continuation", n: 64, win: "56%", avg: "+0.38", exp: "+0.21" },
  { setup: "Opening fade", n: 41, win: "49%", avg: "+0.12", exp: "+0.06" },
  { setup: "Midday mean rev.", n: 38, win: "45%", avg: "−0.04", exp: "−0.02" },
  { setup: "Late liquidity", n: 27, win: "52%", avg: "+0.19", exp: "+0.10" },
];

export function MockAnalytics() {
  return (
    <TerminalFrame
      title="Analytics · performance"
      subtitle="Desk primary · last 90 sessions · R-normalized"
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
          <MockLabel>Overview</MockLabel>
          <div className="flex gap-1 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">
            <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-primary/90">
              By setup
            </span>
            <span className="rounded px-1.5 py-0.5">Regime</span>
            <span className="rounded px-1.5 py-0.5">Session</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <MockKpiCell key={k.label} label={k.label} value={k.value} hint={k.hint} accent={k.accent} />
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-border/60 bg-bv-surface-inset/80 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <MockLabel>Equity · cumulative R</MockLabel>
                <p className="mt-1 font-mono text-[10px] text-zinc-600">Roll 20 · σ scaled</p>
              </div>
              <span className="font-mono text-[10px] tabular-nums text-emerald-400/85">+2.8R · 20d</span>
            </div>
            <div className="mt-2 h-[7.5rem]">
              <svg className="h-full w-full" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.5 0.12 252 / 0.25)" />
                    <stop offset="100%" stopColor="oklch(0.5 0.12 252 / 0)" />
                  </linearGradient>
                  <linearGradient id="eqStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.5 0.12 252)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.1 252)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,88 C40,84 60,72 100,68 C140,64 160,52 200,48 C240,44 260,32 300,28 C340,24 360,16 400,12 L400,120 L0,120 Z"
                  fill="url(#eqFill)"
                />
                <path
                  d="M0,88 C40,84 60,72 100,68 C140,64 160,52 200,48 C240,44 260,32 300,28 C340,24 360,16 400,12"
                  fill="none"
                  stroke="url(#eqStroke)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="mt-1 flex justify-between font-mono text-[8px] text-zinc-600">
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-bv-surface-inset/80 p-3">
            <div>
              <MockLabel>R distribution · net</MockLabel>
              <p className="mt-2 font-mono text-[10px] text-zinc-500">Bucketed by 0.25R · last 90d</p>
            </div>
            <div className="mt-3 flex h-24 items-end gap-px">
              {[12, 22, 38, 52, 68, 44, 28, 18, 10, 6].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[1px] bg-gradient-to-t from-bv-blue-deep to-primary/90"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <MockSparkline className="mt-3 opacity-90" />
          </div>
        </div>

        <div className="mt-4">
          <MockLabel className="mb-1.5">Expectancy by setup · min n ≥ 25</MockLabel>
          <MockTable>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <MockTh>Setup</MockTh>
                  <MockTh className="text-right">n</MockTh>
                  <MockTh className="text-right">Win</MockTh>
                  <MockTh className="text-right">Avg R</MockTh>
                  <MockTh className="text-right">Exp</MockTh>
                </tr>
              </thead>
              <tbody>
                {bySetup.map((row) => (
                  <tr key={row.setup} className="hover:bg-white/[0.02]">
                    <MockTd>{row.setup}</MockTd>
                    <MockTd mono className="text-right text-zinc-400">
                      {row.n}
                    </MockTd>
                    <MockTd mono className="text-right">
                      {row.win}
                    </MockTd>
                    <MockTd mono className="text-right text-zinc-200">
                      {row.avg}
                    </MockTd>
                    <MockTd mono className="text-right text-primary/90">
                      {row.exp}
                    </MockTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </MockTable>
        </div>
      </div>
    </TerminalFrame>
  );
}
