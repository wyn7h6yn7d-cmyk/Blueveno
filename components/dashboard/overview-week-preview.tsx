"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { SectionCard } from "@/components/v2/cards/section-card";
import { LabelValueRow } from "@/components/v2/data/label-value-row";
import { StatusPill } from "@/components/v2/data/status-pill";
import { signedMoney } from "@/lib/user-data/journal-metrics";
import { cn } from "@/lib/utils";
import { overviewCard, overviewInsetCell } from "@/lib/ui/overview-surface";
import { appSecondaryCta } from "@/lib/ui/app-surface";

export type WeekPreviewCell = {
  key: string;
  label: string;
  day: string;
  keys: string[];
};

type OverviewWeekPreviewProps = {
  weekCells: WeekPreviewCell[];
  dayPnlMap: Map<string, number>;
  weekTotal: number;
  hasEntries: boolean;
  displayCurrency: string;
  winningDays: number;
  losingDays: number;
};

export function OverviewWeekPreview({
  weekCells,
  dayPnlMap,
  weekTotal,
  hasEntries,
  displayCurrency,
  winningDays,
  losingDays,
}: OverviewWeekPreviewProps) {
  return (
    <SectionCard
      eyebrow="Calendar"
      title="Current week"
      description="Green and red days at a glance."
      actions={
        <Link href="/app/calendar" className={appSecondaryCta}>
          <CalendarDays className="mr-1.5 size-3.5" />
          Open calendar
        </Link>
      }
      contentClassName="p-4 sm:p-5"
      className={overviewCard}
    >
      <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-6">
        {weekCells.map((cell) => {
          const pnl = cell.keys.reduce((acc, key) => acc + (dayPnlMap.get(key) ?? 0), 0);
          const hasPnl = pnl !== 0;
          const tone =
            pnl > 0
              ? "border-emerald-400/30 bg-emerald-500/12"
              : pnl < 0
                ? "border-rose-400/30 bg-rose-500/12"
                : "border-white/[0.09] bg-[linear-gradient(180deg,oklch(0.12_0.032_264/0.55),oklch(0.1_0.03_268/0.5))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]";
          return (
            <div
              key={cell.key}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border px-1.5 py-2 text-center",
                tone,
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{cell.label}</p>
              <p className="mt-1 font-mono text-[14px] font-semibold tabular-nums text-zinc-50">{cell.day}</p>
              <p
                className={cn(
                  "mt-1 text-[11px] font-medium tabular-nums",
                  !hasPnl && "text-zinc-500",
                  pnl > 0 && "text-emerald-200",
                  pnl < 0 && "text-rose-200",
                )}
              >
                {hasPnl ? signedMoney(pnl, displayCurrency) : "—"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className={cn(overviewInsetCell, "space-y-1 px-4 py-3")}>
          <LabelValueRow
            label="Week total"
            value={hasEntries ? signedMoney(weekTotal, displayCurrency) : "—"}
            valueClassName={cn(
              weekTotal > 0 && "text-emerald-200",
              weekTotal < 0 && "text-rose-200",
            )}
            dense
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <StatusPill tone="win">{winningDays} green</StatusPill>
            <StatusPill tone="loss">{losingDays} red</StatusPill>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
