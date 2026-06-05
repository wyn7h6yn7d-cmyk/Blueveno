import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricDelta } from "@/components/v2/ui/metric-delta";
import { cn } from "@/lib/utils";
import { v2KpiLabel, v2KpiShell, v2KpiValue, v2Supporting } from "@/lib/ui/v2-surface";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  /** Signed change string, e.g. "+12.4R" */
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  deltaLabel?: string;
  icon?: LucideIcon;
  sparkline?: ReactNode;
  loading?: boolean;
  tone?: "neutral" | "positive" | "negative";
  className?: string;
};

const valueToneClass = {
  neutral: "text-zinc-50",
  positive: "text-emerald-200",
  negative: "text-rose-200",
} as const;

export function KpiCard({
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
}: KpiCardProps) {
  if (loading) {
    return (
      <div className={cn(v2KpiShell, "px-4 py-4 sm:px-5 sm:py-5", className)} aria-busy="true">
        <Skeleton className="h-3 w-20 rounded-md bg-white/[0.06]" />
        <Skeleton className="mt-3 h-8 w-28 rounded-md bg-white/[0.08]" />
        <Skeleton className="mt-2 h-3 w-16 rounded-md bg-white/[0.05]" />
      </div>
    );
  }

  return (
    <article className={cn(v2KpiShell, "relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5", className)}>
      <div
        className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-[radial-gradient(circle,oklch(0.48_0.12_252/0.1),transparent_68%)]"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={v2KpiLabel}>{label}</p>
          <p className={cn(v2KpiValue, "mt-2", valueToneClass[tone])}>{value}</p>
          {delta ? (
            <div className="mt-2">
              <MetricDelta value={delta} direction={deltaDirection} label={deltaLabel} />
            </div>
          ) : null}
          {hint ? <p className={cn(v2Supporting, "mt-2")}>{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400">
            <Icon className="size-[17px]" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>
      {sparkline ? <div className="relative mt-3 h-9 w-full">{sparkline}</div> : null}
    </article>
  );
}
