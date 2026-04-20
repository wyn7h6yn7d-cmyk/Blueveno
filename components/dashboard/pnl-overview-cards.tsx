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

const defaultData: PnLCardDatum[] = [
  {
    id: "session",
    label: "Session",
    netUsd: "+$1,240",
    netR: "+1.9 R",
    vsPrior: "+0.4 R vs yesterday",
    vsPriorPositive: true,
  },
  {
    id: "week",
    label: "Week",
    netUsd: "+$4,180",
    netR: "+6.2 R",
    vsPrior: "+1.1 R vs prior week",
    vsPriorPositive: true,
  },
  {
    id: "month",
    label: "30 days",
    netUsd: "+$18,960",
    netR: "+24.1 R",
    vsPrior: "−2.3 R vs prior 30d",
    vsPriorPositive: false,
  },
];

type PnLOverviewCardsProps = {
  items?: PnLCardDatum[];
  className?: string;
};

export function PnLOverviewCards({ items = defaultData, className }: PnLOverviewCardsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {items.map((d, i) => (
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
              <p className="mt-1 font-mono text-[13px] tabular-nums text-[oklch(0.78_0.1_250)]">{d.netR}</p>
            </div>
            <div className="w-20 shrink-0 opacity-90">
              <MiniSparkline positive={d.vsPriorPositive ?? true} />
            </div>
          </div>
          <p
            className={cn(
              "mt-4 border-t border-white/[0.06] pt-3 font-mono text-[11px] leading-snug",
              d.vsPriorPositive ? "text-zinc-500" : "text-amber-200/85",
            )}
          >
            {d.vsPrior}
          </p>
          {i === 0 ? (
            <p className="mt-2 font-mono text-[10px] text-zinc-600">Futures · combined accounts · after fees</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
