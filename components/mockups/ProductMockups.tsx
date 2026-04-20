import { MockupFrame } from "./MockupFrame";

export function JournalStripMock() {
  return (
    <MockupFrame label="auto journal · stream" className="h-full">
      <div className="divide-y divide-white/[0.06]">
        {[
          {
            t: "09:42",
            s: "ORB · long",
            p: "+0.4 R",
            tag: "A+",
          },
          {
            t: "10:18",
            s: "Pullback · short",
            p: "+0.9 R",
            tag: "B",
          },
          {
            t: "11:03",
            s: "Re-entry · long",
            p: "−0.2 R",
            tag: "C",
          },
        ].map((row) => (
          <div
            key={row.t}
            className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
          >
            <span className="font-mono text-xs text-zinc-500">{row.t}</span>
            <span className="text-zinc-200">{row.s}</span>
            <span className="ml-auto font-mono text-xs text-teal-300/90">{row.p}</span>
            <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              {row.tag}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-2 font-mono text-[10px] text-zinc-500">
        Notes + screenshots sync from your execution platform in the background.
      </div>
    </MockupFrame>
  );
}

export function PlaybookMock() {
  return (
    <MockupFrame label="playbook · pre-market" className="h-full">
      <div className="space-y-4 p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Conditions
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
            <li className="flex gap-2">
              <span className="text-teal-400/80">—</span> Open drive confirmed above VWAP
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400/80">—</span> First pullback holds prior high
            </li>
            <li className="flex gap-2">
              <span className="text-zinc-600">—</span> No news within 15 minutes
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#05060a] p-4">
          <p className="font-mono text-[10px] text-zinc-500">If-then</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            If the opening range breaks with expanding volume, then scale in on the first
            failed counter-trend push—max 2 adds, hard stop at OR low.
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}

export function PropRulesMock() {
  return (
    <MockupFrame label="prop desk · guardrails" className="h-full">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Daily loss buffer
            </p>
            <p className="font-display mt-1 text-2xl text-zinc-100">38%</p>
            <p className="font-mono text-[10px] text-zinc-500">remaining before halt</p>
          </div>
          <div className="h-16 w-16 rounded-full border border-white/[0.08] bg-gradient-to-br from-teal-500/20 to-transparent p-1">
            <div className="flex h-full w-full items-center justify-center rounded-full border border-white/[0.06] font-mono text-xs text-teal-200">
              OK
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {[
            { rule: "Trailing drawdown", state: "watch" },
            { rule: "Consistency days", state: "clear" },
            { rule: "News blackout", state: "clear" },
          ].map((r) => (
            <div
              key={r.rule}
              className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <span className="text-xs text-zinc-400">{r.rule}</span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider ${
                  r.state === "watch" ? "text-amber-300/90" : "text-emerald-400/80"
                }`}
              >
                {r.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

export function ScreenshotReviewMock() {
  return (
    <MockupFrame label="review · chart capture" className="h-full">
      <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-[4/3] border-b border-white/[0.06] bg-[#0b0c12] md:border-b-0 md:border-r">
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
          <div className="absolute inset-4 rounded-lg border border-white/[0.08] bg-gradient-to-br from-zinc-800/40 to-zinc-950/80" />
          <div className="absolute bottom-6 left-6 right-6 rounded-md border border-teal-500/25 bg-black/60 px-3 py-2 font-mono text-[10px] text-teal-200/90 backdrop-blur-sm">
            Entry: liquidity sweep + reclaim · 1m trigger
          </div>
        </div>
        <div className="flex flex-col justify-between p-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Annotation layers
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Tie the picture to the fill. Blueveno keeps the narrative attached to the
              trade record—so reviews stay honest when memory drifts.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Liquidity", "VWAP", "ORB", "FOMO"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

export function SessionRecapMock() {
  return (
    <MockupFrame label="session recap · export" className="h-full">
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-zinc-100">Tuesday · NY morning</h3>
          <span className="font-mono text-xs text-zinc-500">Generated 16:02</span>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#05060a] p-4 font-mono text-[11px] leading-relaxed text-zinc-400">
          <p className="text-zinc-500">Summary</p>
          <p className="mt-2 text-zinc-300">
            Two clean executions, one scratch. Edge came from patience after the open
            drive; the loss was a sizing lapse on a marginal second entry.
          </p>
          <p className="mt-4 text-zinc-500">Focus next session</p>
          <p className="mt-2 text-zinc-300">
            Enforce max adds on B-grade setups. Keep screenshots mandatory for any trade
            above 0.5 R risk.
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}
