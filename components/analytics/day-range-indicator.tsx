import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { cn } from "@/lib/utils";

type DayRangeIndicatorProps = {
  best: number | null;
  worst: number | null;
  currency: string;
  className?: string;
};

export function DayRangeIndicator({ best, worst, currency, className }: DayRangeIndicatorProps) {
  const bestVal = best !== null && Number.isFinite(best) ? best : null;
  const worstVal = worst !== null && Number.isFinite(worst) ? worst : null;

  if (bestVal === null && worstVal === null) {
    return <p className={cn("text-[13px] text-zinc-500", className)}>Range appears after a few logged days.</p>;
  }

  const span = Math.max(Math.abs(bestVal ?? 0), Math.abs(worstVal ?? 0), 1);
  const bestPos = bestVal !== null && bestVal >= 0 ? 50 + (bestVal / span) * 50 : 50;
  const worstPos = worstVal !== null ? 50 - (Math.abs(Math.min(worstVal, 0)) / span) * 50 : 50;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.12]" aria-hidden />
        {bestVal !== null ? (
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_12px_oklch(0.5_0.14_155/0.55)]"
            style={{ left: `${Math.min(96, Math.max(4, bestPos))}%` }}
            title={`Best ${formatSignedPnlAmount(bestVal, currency)}`}
          />
        ) : null}
        {worstVal !== null ? (
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 shadow-[0_0_12px_oklch(0.5_0.15_15/0.5)]"
            style={{ left: `${Math.min(96, Math.max(4, worstPos))}%` }}
            title={`Worst ${formatSignedPnlAmount(worstVal, currency)}`}
          />
        ) : null}
      </div>
      <div className="flex justify-between gap-3 text-[12px] tabular-nums">
        <span className={cn(bestVal !== null && bestVal >= 0 ? "text-emerald-200" : "text-zinc-400")}>
          Best {bestVal !== null ? formatSignedPnlAmount(bestVal, currency) : "—"}
        </span>
        <span className={cn(worstVal !== null && worstVal < 0 ? "text-rose-200" : "text-zinc-400")}>
          Worst {worstVal !== null ? formatSignedPnlAmount(worstVal, currency) : "—"}
        </span>
      </div>
    </div>
  );
}
