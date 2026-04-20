/**
 * Dense workspace preview — matches product analytics + ledger tone (not decorative).
 */
export function PlatformPreviewStrip() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-bv-surface shadow-bv-card ring-1 ring-primary/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-black/35 px-4 py-2.5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Workspace</p>
          <p className="mt-0.5 font-mono text-[10px] text-zinc-400">Desk primary · NY · R-normalized</p>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400/90">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
          Linked
        </span>
      </div>

      <div className="grid gap-px bg-border/40 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-bv-surface-inset/90 p-4">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">Equity · 90 sessions</p>
          <div className="mt-2 h-24">
            <svg className="h-full w-full" viewBox="0 0 360 96" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="stripEq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.5 0.12 252 / 0.22)" />
                  <stop offset="100%" stopColor="oklch(0.5 0.12 252 / 0)" />
                </linearGradient>
                <linearGradient id="stripSt" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.52 0.11 252)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.1 252)" />
                </linearGradient>
              </defs>
              <path
                d="M0,72 C36,68 54,58 90,54 C126,50 144,40 180,36 C216,32 234,22 270,18 C306,14 324,10 360,8 L360,96 L0,96 Z"
                fill="url(#stripEq)"
              />
              <path
                d="M0,72 C36,68 54,58 90,54 C126,50 144,40 180,36 C216,32 234,22 270,18 C306,14 324,10 360,8"
                fill="none"
                stroke="url(#stripSt)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="mt-2 flex justify-between font-mono text-[8px] text-zinc-600">
            <span>Net R</span>
            <span className="tabular-nums text-zinc-300">+14.82</span>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-bv-surface/95 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">Expectancy</p>
              <p className="mt-1 font-display text-lg tabular-nums text-zinc-100">+0.21</p>
              <p className="font-mono text-[8px] text-zinc-600">R / trade</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">Win rate</p>
              <p className="mt-1 font-display text-lg tabular-nums text-zinc-100">52.4%</p>
              <p className="font-mono text-[8px] text-zinc-600">n = 218</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">Rule checks</p>
              <p className="mt-1 font-display text-lg tabular-nums text-emerald-400/90">0 open</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">Review queue</p>
              <p className="mt-1 font-display text-lg tabular-nums text-amber-200/90">2</p>
            </div>
          </div>
          <p className="mt-3 border-t border-border/50 pt-2 font-mono text-[8px] leading-snug text-zinc-600">
            One record—analytics, journal, compliance. No duplicate entry.
          </p>
        </div>
      </div>
    </div>
  );
}
