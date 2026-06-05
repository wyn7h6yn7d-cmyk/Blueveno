"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionCard } from "@/components/v2/cards";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import { PnlCell } from "@/components/v2/tables";
import { overviewCard, overviewInsetCell } from "@/lib/ui/overview-surface";
import { cn } from "@/lib/utils";

export type OverviewRecentEntry = {
  id: string;
  symbol: string;
  dateLabel: string;
  pnl: number | null;
  mood: string | null;
  tag: string | null;
  discipline: string;
};

type OverviewRecentEntriesListProps = {
  entries: OverviewRecentEntry[];
  displayCurrency: string;
  loading?: boolean;
  onOpenEntry: (id: string) => void;
};

export function OverviewRecentEntriesList({
  entries,
  displayCurrency,
  loading = false,
  onOpenEntry,
}: OverviewRecentEntriesListProps) {
  return (
    <SectionCard
      eyebrow="Journal"
      title="Recent entries"
      description="Latest five trades on this account."
      loading={loading}
      contentClassName="p-3 sm:p-4"
      className={cn("h-full", overviewCard)}
    >
      {entries.length === 0 ? (
        <EmptyStatePanel
          title="No entries yet"
          description="Log your first trade to see recent activity here."
          action={
            <Link href="/app/journal?tab=add" className="text-[13px] text-bv-ice hover:underline">
              New entry
            </Link>
          }
          compact
        />
      ) : (
        <ul className="blueveno-scrollbar max-h-[min(24rem,50vh)] space-y-2 overflow-y-auto pr-0.5">
          {entries.map((row) => {
            const meta = [row.mood, row.tag].filter((t): t is string => Boolean(t));
            return (
              <li key={row.id}>
                <div
                  className={cn(
                    overviewInsetCell,
                    "flex items-center gap-3 px-3 py-2.5 transition-colors hover:border-bv-blue-accent/20 hover:bg-white/[0.035]",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-50">{row.symbol}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{row.dateLabel}</p>
                  </div>
                  <PnlCell value={row.pnl} currency={displayCurrency} className="shrink-0 text-[12px]" />
                  <div className="hidden min-w-[4.5rem] shrink-0 sm:block">
                    {meta.length > 0 ? (
                      <p className="truncate text-[11px] text-zinc-400">{meta.join(" · ")}</p>
                    ) : (
                      <p className="text-[11px] text-zinc-600">—</p>
                    )}
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{row.discipline}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenEntry(row.id)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:border-bv-blue-accent/25 hover:bg-bv-blue-accent/10 hover:text-bv-ice"
                    aria-label={`Open ${row.symbol} entry`}
                  >
                    <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
