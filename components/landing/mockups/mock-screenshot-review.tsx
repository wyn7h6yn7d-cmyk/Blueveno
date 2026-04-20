import { cn } from "@/lib/utils";
import { TerminalFrame } from "./terminal-frame";
import { MockLabel, MockPill } from "./mockup-primitives";

function ChartMock() {
  const bars = [38, 52, 44, 36, 48, 33, 58, 46];
  return (
    <div className="relative aspect-[5/4] bg-bv-void">
      <div className="absolute inset-0 bg-grid-fine opacity-[0.2]" aria-hidden />
      <div className="absolute inset-x-4 top-[20%] h-px bg-primary/30" />
      <div className="absolute inset-x-4 top-[45%] h-px bg-white/[0.06]" />
      <div className="absolute inset-x-4 top-[70%] h-px bg-white/[0.06]" />
      <div className="absolute left-2 top-3 space-y-6 font-mono text-[8px] tabular-nums text-zinc-600">
        <span>4528.50</span>
        <span className="block">4524.25</span>
        <span className="block">4519.00</span>
      </div>
      <div className="absolute bottom-5 left-10 right-4 top-12 flex items-end justify-between gap-[3px]">
        {bars.map((h, i) => (
          <div key={i} className="relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-[1px] bg-gradient-to-t from-bv-blue-deep to-primary/90"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-[30%] left-[62%] flex -translate-x-1/2 flex-col items-center">
        <span className="rounded border border-primary/45 bg-primary/15 px-1 py-0.5 font-mono text-[7px] uppercase tracking-wider text-primary">
          Entry
        </span>
        <span className="mt-0.5 h-7 w-px bg-primary/70" />
      </div>
    </div>
  );
}

export function MockScreenshotReview() {
  return (
    <TerminalFrame title="Review · chart + fill" subtitle="Link ID · BR-09F2C8 · immutable">
      <div className="grid md:grid-cols-[1.12fr_0.88fr]">
        <div className="border-b border-border/60 md:border-b-0 md:border-r">
          <ChartMock />
          <div className="border-t border-border/60 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <MockLabel>Capture</MockLabel>
              <span className="font-mono text-[8px] text-zinc-600">09:44:06 · 2× crop</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-[4/3] rounded border bg-zinc-900/80",
                    i === 1 ? "border-primary/35 ring-1 ring-primary/20" : "border-border/50",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-3 sm:p-4">
          <MockLabel>Linked execution</MockLabel>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-border/60 bg-bv-surface-inset/90 px-2 py-1.5">
                <p className="font-mono text-[8px] uppercase text-zinc-600">Symbol</p>
                <p className="mt-0.5 font-mono text-xs text-zinc-200">ESZ5</p>
              </div>
              <div className="rounded border border-border/60 bg-bv-surface-inset/90 px-2 py-1.5">
                <p className="font-mono text-[8px] uppercase text-zinc-600">Avg price</p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-zinc-200">4524.25</p>
              </div>
              <div className="rounded border border-border/60 bg-bv-surface-inset/90 px-2 py-1.5">
                <p className="font-mono text-[8px] uppercase text-zinc-600">Working time</p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-zinc-200">09:44:02.18</p>
              </div>
              <div className="rounded border border-border/60 bg-bv-surface-inset/90 px-2 py-1.5">
                <p className="font-mono text-[8px] uppercase text-zinc-600">Route</p>
                <p className="mt-0.5 font-mono text-xs text-zinc-300">Limit · IOC</p>
              </div>
            </div>
            <div className="rounded border border-border/50 bg-black/30 px-2.5 py-2">
              <p className="font-mono text-[8px] uppercase text-zinc-600">Note</p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                Liquidity sweep at prior HVN; stop beyond 1-tick invalidation. Screenshot shows tape at
                print.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MockPill tone="ok">Verified</MockPill>
              <span className="font-mono text-[9px] text-zinc-600">Hash pinned · review locked</span>
            </div>
          </div>
        </div>
      </div>
    </TerminalFrame>
  );
}
