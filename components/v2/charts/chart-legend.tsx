import { cn } from "@/lib/utils";
import { v2MonoMeta } from "@/lib/ui/v2-surface";
import type { V2ChartSeriesTone } from "@/components/v2/charts/chart-colors";
import { v2ChartSeriesColor } from "@/components/v2/charts/chart-colors";

export type ChartLegendItem = {
  id: string;
  label: string;
  value?: string;
  tone?: V2ChartSeriesTone;
  /** Override swatch color */
  color?: string;
};

type ChartLegendProps = {
  items: ChartLegendItem[];
  className?: string;
  layout?: "row" | "stack";
};

export function ChartLegend({ items, className, layout = "row" }: ChartLegendProps) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex gap-3 sm:gap-4",
        layout === "stack" ? "flex-col" : "flex-wrap items-center",
        className,
      )}
      aria-label="Chart legend"
    >
      {items.map((item) => {
        const swatchColor = item.color ?? v2ChartSeriesColor(item.tone ?? "primary");
        return (
          <li key={item.id} className="flex min-w-0 items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: swatchColor }}
              aria-hidden
            />
            <span className={cn(v2MonoMeta, "normal-case tracking-normal text-zinc-500")}>{item.label}</span>
            {item.value ? (
              <span className="font-mono text-[11px] tabular-nums text-zinc-300">{item.value}</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
