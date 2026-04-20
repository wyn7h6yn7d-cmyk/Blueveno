import { TerminalFrame } from "./terminal-frame";

export function MockAutoJournal() {
  return (
    <TerminalFrame title="ingest · trade stream" className="h-full">
      <div className="divide-y divide-white/[0.06] p-1">
        {[
          { t: "09:44", tag: "Long · ORB", r: "+0.5" },
          { t: "10:12", tag: "Short · fade", r: "+0.8" },
          { t: "11:03", tag: "Scratch", r: "−0.1" },
        ].map((row) => (
          <div key={row.t} className="flex items-center gap-3 px-3 py-2.5 font-mono text-[11px]">
            <span className="text-zinc-500">{row.t}</span>
            <span className="flex-1 text-zinc-300">{row.tag}</span>
            <span className="tabular-nums text-[oklch(0.72_0.12_250)]">{row.r} R</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-[9px] text-zinc-500">
        Fills normalized · tags applied · no reconstructed day
      </div>
    </TerminalFrame>
  );
}

export function MockAnalytics() {
  return (
    <TerminalFrame title="analytics · expectancy" className="h-full">
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {["By setup", "By session", "By regime"].map((l) => (
            <div
              key={l}
              className="rounded-lg border border-white/[0.06] bg-[oklch(0.08_0.03_265)] px-2 py-2 text-center"
            >
              <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500">{l}</p>
              <p className="mt-1 font-mono text-sm text-zinc-200">—</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex h-24 items-end gap-1">
          {[35, 52, 28, 61, 44, 70, 38, 55, 48, 66].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[oklch(0.3_0.08_260)] to-[oklch(0.6_0.14_250)]" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-3 font-mono text-[9px] text-zinc-600">
          Same slice logic across dimensions—one underlying record
        </p>
      </div>
    </TerminalFrame>
  );
}

export function MockScreenshotReview() {
  return (
    <TerminalFrame title="review · chart + fill" className="h-full">
      <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-[5/4] border-b border-white/[0.06] bg-[oklch(0.07_0.03_265)] md:border-b-0 md:border-r">
          <div className="absolute inset-0 bg-grid-fine opacity-30" />
          <div className="absolute inset-5 rounded-lg border border-white/[0.08] bg-gradient-to-br from-zinc-800/50 to-zinc-950" />
          <div className="absolute bottom-5 left-5 right-5 rounded border border-[oklch(0.55_0.15_250/0.35)] bg-black/55 px-2 py-1.5 font-mono text-[9px] text-[oklch(0.85_0.06_250)] backdrop-blur-sm">
            Entry: liquidity · trigger aligned
          </div>
        </div>
        <div className="p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Linked record</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Screenshot and fill share one ID — review cannot drift from what actually printed.
          </p>
        </div>
      </div>
    </TerminalFrame>
  );
}

export function MockPlaybooks() {
  return (
    <TerminalFrame title="playbook · conditions" className="h-full">
      <div className="space-y-3 p-4">
        {[
          { ok: true, text: "Opening drive holds above prior day mid" },
          { ok: true, text: "First pullback shallow vs. reference" },
          { ok: false, text: "Macro event inside 20m window" },
        ].map((c, i) => (
          <div
            key={i}
            className="flex gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs text-zinc-300"
          >
            <span className={c.ok ? "text-emerald-400/80" : "text-zinc-600"}>{c.ok ? "✓" : "○"}</span>
            {c.text}
          </div>
        ))}
        <div className="rounded-lg border border-dashed border-white/[0.1] bg-[oklch(0.07_0.03_265)] p-3 font-mono text-[10px] leading-relaxed text-zinc-500">
          If all green → scale defined. If red → no add.
        </div>
      </div>
    </TerminalFrame>
  );
}

export function MockBehavior() {
  return (
    <TerminalFrame title="behavior · impulses" className="h-full">
      <div className="space-y-2 p-4">
        {[
          { n: "Early size-up", s: "watch" },
          { n: "Re-entry without plan", s: "flagged" },
          { n: "Stop respect", s: "stable" },
        ].map((b) => (
          <div key={b.n} className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2">
            <span className="text-xs text-zinc-400">{b.n}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-[oklch(0.72_0.12_250)]">
              {b.s}
            </span>
          </div>
        ))}
        <p className="pt-2 font-mono text-[9px] text-zinc-600">
          Patterns surface before they dominate the month.
        </p>
      </div>
    </TerminalFrame>
  );
}

export function MockSessionRecap() {
  return (
    <TerminalFrame title="recap · session export" className="h-full">
      <div className="p-4 font-mono text-[11px] leading-relaxed text-zinc-400">
        <p className="text-zinc-500">Summary</p>
        <p className="mt-2 text-zinc-300">
          Two clean sequences; one discretionary add outside playbook. Edge came from patience at the open.
        </p>
        <p className="mt-4 text-zinc-500">Next session</p>
        <p className="mt-2 text-zinc-300">Enforce max adds when first target is partial.</p>
      </div>
    </TerminalFrame>
  );
}

export function MockRuleViolations() {
  return (
    <TerminalFrame title="rules · violations" className="h-full">
      <div className="divide-y divide-white/[0.06]">
        {[
          { rule: "Max daily loss", state: "ok", detail: "−0.4 / −1.0 R" },
          { rule: "News blackout", state: "ok", detail: "clear" },
          { rule: "Consistency window", state: "warn", detail: "2 days to minimum" },
        ].map((r) => (
          <div key={r.rule} className="flex items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="text-xs text-zinc-300">{r.rule}</p>
              <p className="font-mono text-[9px] text-zinc-600">{r.detail}</p>
            </div>
            <span
              className={`font-mono text-[10px] uppercase ${
                r.state === "ok" ? "text-emerald-400/80" : "text-amber-300/90"
              }`}
            >
              {r.state}
            </span>
          </div>
        ))}
      </div>
    </TerminalFrame>
  );
}

export function MockAccountProp() {
  return (
    <TerminalFrame title="accounts · prop desk" className="h-full">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Drawdown buffer
            </p>
            <p className="font-display mt-1 text-3xl text-zinc-100">41%</p>
            <p className="font-mono text-[9px] text-zinc-600">before soft halt</p>
          </div>
          <div className="flex size-16 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-[oklch(0.35_0.12_260)] to-transparent font-mono text-xs text-[oklch(0.75_0.1_250)]">
            OK
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {["Trailing DD", "Min profit days", "Payout lockout"].map((x) => (
            <div
              key={x}
              className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400"
            >
              {x}
              <span className="font-mono text-[9px] text-zinc-600">synced</span>
            </div>
          ))}
        </div>
      </div>
    </TerminalFrame>
  );
}
