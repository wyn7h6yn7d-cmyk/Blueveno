import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MetricDelta } from "@/components/v2/data/metric-delta";
import { CardSkeleton } from "@/components/v2/states/card-skeleton";
import { cn } from "@/lib/utils";
import { v2KpiLabel, v2KpiShell, v2KpiValue, v2Supporting } from "@/lib/ui/v2-surface";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  deltaLabel?: string;
  icon?: LucideIcon;
  sparkline?: ReactNode;
  loading?: boolean;
  tone?: "neutral" | "positive" | "negative" | "caution";
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  iconWrapClassName?: string;
};

const valueToneClass = {
  neutral: "text-zinc-50",
  positive: "text-emerald-200",
  negative: "text-rose-200",
  caution: "text-amber-200",
} as const;

export function MetricCard({
  label,
  value,
  hint,
  delta,
  deltaDirection = "flat",
  deltaLabel,
  icon: Icon,
  sparkline,
  loading = false,
  tone = "neutral",
  className,
  labelClassName,
  valueClassName,
  iconWrapClassName,
}: MetricCardProps) {
  if (loading) {
    return <CardSkeleton variant="metric" className={className} />;
  }

  return (
    <article className={cn(v2KpiShell, "relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5", className)}>
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn(v2KpiLabel, labelClassName)}>{label}</p>
          <p className={cn(v2KpiValue, "mt-2", valueToneClass[tone], valueClassName)}>{value}</p>
          {delta ? (
            <div className="mt-2">
              <MetricDelta value={delta} direction={deltaDirection} label={deltaLabel} />
            </div>
          ) : null}
          {hint ? <p className={cn(v2Supporting, "mt-2")}>{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400",
              iconWrapClassName,
            )}
          >
            <Icon className="size-[17px]" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>
      {sparkline ? <div className="relative mt-3 h-9 w-full">{sparkline}</div> : null}
    </article>
  );
}
