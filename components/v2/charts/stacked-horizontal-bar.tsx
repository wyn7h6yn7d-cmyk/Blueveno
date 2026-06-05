import { cn } from "@/lib/utils";
import { v2KpiLabel, v2MonoMeta } from "@/lib/ui/v2-surface";
import { V2_CHART_COLORS } from "@/components/v2/charts/chart-colors";

export type StackedBarSegment = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

type StackedHorizontalBarProps = {
  segments: StackedBarSegment[];
  className?: string;
  showLegend?: boolean;
};

const defaultColors = [
  V2_CHART_COLORS.positive,
  V2_CHART_COLORS.negative,
  V2_CHART_COLORS.primary,
  V2_CHART_COLORS.neutral,
];

export function StackedHorizontalBar({ segments, className, showLegend = true }: StackedHorizontalBarProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0);
  if (total <= 0) {
    return <p className="text-[12px] text-zinc-500">No distribution data yet.</p>;
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.08]" role="img" aria-label="Distribution bar">
        {segments.map((seg, i) => {
          const width = (Math.max(seg.value, 0) / total) * 100;
          if (width <= 0) return null;
          return (
            <div
              key={seg.id}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${width}%`,
                backgroundColor: seg.color ?? defaultColors[i % defaultColors.length],
              }}
              title={`${seg.label}: ${Math.round(width)}%`}
            />
          );
        })}
      </div>
      {showLegend ? (
        <div className="flex flex-wrap gap-3">
          {segments.map((seg, i) => (
            <div key={seg.id} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: seg.color ?? defaultColors[i % defaultColors.length] }}
                aria-hidden
              />
              <span className={v2MonoMeta}>{seg.label}</span>
              <span className={v2KpiLabel}>{Math.round((Math.max(seg.value, 0) / total) * 100)}%</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
