import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { cn } from "@/lib/utils";
import { v2Supporting } from "@/lib/ui/v2-surface";

type RangeIndicatorProps = {
  best: number | null;
  worst: number | null;
  currency?: string;
  /** Use R-multiple labels instead of currency */
  unit?: "currency" | "r";
  className?: string;
};

function formatValue(n: number | null, unit: "currency" | "r", currency: string): string {
  if (n === null || !Number.isFinite(n)) return "—";
  if (unit === "r") {
    const sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return `${sign}${Math.abs(n).toFixed(1)}R`;
  }
  return formatSignedPnlAmount(n, currency);
}

export function RangeIndicator({
  best,
  worst,
  currency = "EUR",
  unit = "currency",
  className,
}: RangeIndicatorProps) {
  const bestVal = best !== null && Number.isFinite(best) ? best : null;
  const worstVal = worst !== null && Number.isFinite(worst) ? worst : null;

  if (bestVal === null && worstVal === null) {
    return <p className={cn(v2Supporting, className)}>Range appears after a few logged days.</p>;
  }

  const span = Math.max(Math.abs(bestVal ?? 0), Math.abs(worstVal ?? 0), 1);
  const bestPos = bestVal !== null && bestVal >= 0 ? 50 + (bestVal / span) * 50 : 50;
  const worstPos = worstVal !== null ? 50 - (Math.abs(Math.min(worstVal, 0)) / span) * 50 : 50;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.12]" aria-hidden />
        {bestVal !== null ? (
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400"
            style={{ left: `${Math.min(96, Math.max(4, bestPos))}%` }}
            title={`Best ${formatValue(bestVal, unit, currency)}`}
          />
        ) : null}
        {worstVal !== null ? (
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400"
            style={{ left: `${Math.min(96, Math.max(4, worstPos))}%` }}
            title={`Worst ${formatValue(worstVal, unit, currency)}`}
          />
        ) : null}
      </div>
      <div className="flex justify-between gap-3 font-mono text-[11px] tabular-nums">
        <span className={cn(bestVal !== null && bestVal >= 0 ? "text-emerald-200" : "text-zinc-400")}>
          Best {formatValue(bestVal, unit, currency)}
        </span>
        <span className={cn(worstVal !== null && worstVal < 0 ? "text-rose-200" : "text-zinc-400")}>
          Worst {formatValue(worstVal, unit, currency)}
        </span>
      </div>
    </div>
  );
}
