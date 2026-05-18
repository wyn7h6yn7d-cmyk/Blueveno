import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { appMetricLabel } from "@/lib/ui/app-surface";

export type MetricStripItem = {
  label: string;
  value: string;
  tone?: number;
  icon?: LucideIcon;
};

type MetricStripProps = {
  items: MetricStripItem[];
  className?: string;
};

export function MetricStrip({ items, className }: MetricStripProps) {
  const count = items.length;

  return (
    <section
      className={cn(
        "grid gap-3 rounded-2xl border border-[oklch(0.52_0.12_252/0.2)] bg-[linear-gradient(165deg,oklch(0.14_0.038_262/0.94),oklch(0.09_0.03_266/0.92))] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05),0_0_40px_-24px_oklch(0.45_0.14_252/0.4)] sm:gap-4 sm:p-5",
        count <= 2 && "grid-cols-2",
        count === 3 && "grid-cols-1 min-[480px]:grid-cols-3",
        count === 4 && "grid-cols-2 lg:grid-cols-4",
        count >= 5 && "grid-cols-2 lg:grid-cols-5",
        className,
      )}
      aria-label="Key metrics"
    >
      {items.map((item) => (
        <div key={item.label} className="relative min-w-0 px-1 py-1 sm:px-2">
          <div className="flex items-start justify-between gap-2">
            <p className={appMetricLabel}>{item.label}</p>
            {item.icon ? (
              <item.icon className="size-4 shrink-0 text-[oklch(0.72_0.11_252)]" strokeWidth={1.75} aria-hidden />
            ) : null}
          </div>
          <p
            className={cn(
              "font-display mt-2 text-[1.65rem] leading-none tabular-nums tracking-[-0.035em] sm:text-[1.85rem]",
              (item.tone ?? 0) > 0 && "text-emerald-200",
              (item.tone ?? 0) < 0 && "text-rose-200",
              (item.tone ?? 0) === 0 && "text-zinc-50",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
