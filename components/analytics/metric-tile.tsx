import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/ui/card-system";
import { cn } from "@/lib/utils";
import { appMetricLabel } from "@/lib/ui/app-surface";

type MetricTileProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: number;
  icon?: LucideIcon;
  className?: string;
};

export function MetricTile({ label, value, hint, tone = 0, icon: Icon, className }: MetricTileProps) {
  return (
    <MetricCard className={cn("relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6", className)}>
      <div
        className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-[radial-gradient(circle,oklch(0.48_0.12_252/0.14),transparent_68%)]"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={appMetricLabel}>{label}</p>
          <p
            className={cn(
              "font-display mt-2.5 text-[1.85rem] leading-none tabular-nums tracking-[-0.04em] sm:text-[2.15rem]",
              tone > 0 && "text-emerald-200",
              tone < 0 && "text-rose-200",
              tone === 0 && "text-zinc-50",
            )}
          >
            {value}
          </p>
          {hint ? <p className="mt-2 text-[13px] leading-snug text-zinc-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400">
            <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>
    </MetricCard>
  );
}
