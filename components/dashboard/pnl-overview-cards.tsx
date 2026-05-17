import { cn } from "@/lib/utils";
import {
  DashboardEyebrow,
  dashboardPanelClass,
} from "@/components/dashboard/dashboard-primitives";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";

export type PnLCardDatum = {
  id: string;
  label: string;
  netUsd: string;
  netR: string;
  vsPrior: string;
  /** Positive = green-ish delta copy */
  vsPriorPositive?: boolean;
};

type PnLOverviewCardsProps = {
  items: PnLCardDatum[];
  className?: string;
};

export function PnLOverviewCards({ items, className }: PnLOverviewCardsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {items.map((d) => (
        <article
          key={d.id}
          className={cn(dashboardPanelClass, "flex flex-col p-4 sm:p-5")}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <DashboardEyebrow>{d.label}</DashboardEyebrow>
              <p className="font-display mt-2 text-2xl tabular-nums tracking-tight text-zinc-50 md:text-[1.65rem]">
                {d.netUsd}
              </p>
              <p className="mt-1 font-mono text-[13px] tabular-nums text-bv-ice/90">{d.netR}</p>
            </div>
            <div className="w-20 shrink-0 opacity-90">
              <MiniSparkline positive={d.vsPriorPositive ?? true} />
            </div>
          </div>
          <p
            className={cn(
              "mt-4 border-t border-white/[0.06] pt-3 text-[12px] leading-snug text-zinc-500",
              !d.vsPriorPositive && "text-amber-200/85",
            )}
          >
            {d.vsPrior}
          </p>
        </article>
      ))}
    </div>
  );
}
