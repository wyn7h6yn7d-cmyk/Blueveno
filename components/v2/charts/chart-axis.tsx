import { cn } from "@/lib/utils";
import { v2MonoMeta } from "@/lib/ui/v2-surface";

type ChartAxisLabelsProps = {
  labels: string[];
  className?: string;
};

/** Horizontal axis tick labels below a chart */
export function ChartAxisLabels({ labels, className }: ChartAxisLabelsProps) {
  if (labels.length === 0) return null;

  return (
    <div
      className={cn("grid w-full gap-1", className)}
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {labels.map((label, i) => (
        <span
          key={`${label}-${i}`}
          className={cn(
            v2MonoMeta,
            "truncate text-center",
            i === 0 && "text-left",
            i === labels.length - 1 && "text-right",
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

type ChartYAxisProps = {
  min: string;
  max: string;
  mid?: string;
  className?: string;
};

/** Compact Y-axis reference labels */
export function ChartYAxisLabels({ min, max, mid, className }: ChartYAxisProps) {
  return (
    <div className={cn("flex flex-col justify-between py-1 pr-2 text-right", className)} aria-hidden>
      <span className={v2MonoMeta}>{max}</span>
      {mid ? <span className={v2MonoMeta}>{mid}</span> : null}
      <span className={v2MonoMeta}>{min}</span>
    </div>
  );
}
