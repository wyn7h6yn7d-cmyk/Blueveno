import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { cn } from "@/lib/utils";
import { v2TextNegative, v2TextPositive } from "@/lib/ui/v2-surface";

type PnlCellProps = {
  value: number | null;
  currency?: string;
  /** Display as R-multiple */
  unit?: "currency" | "r";
  className?: string;
};

function formatR(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)}R`;
}

export function PnlCell({ value, currency = "EUR", unit = "currency", className }: PnlCellProps) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={cn("font-mono text-[13px] tabular-nums text-zinc-500", className)}>—</span>;
  }

  const display = unit === "r" ? formatR(value) : formatSignedPnlAmount(value, currency);
  const tone = value > 0 ? v2TextPositive : value < 0 ? v2TextNegative : "text-zinc-300";

  return (
    <span className={cn("font-mono text-[13px] font-medium tabular-nums", tone, className)}>
      {display}
    </span>
  );
}
