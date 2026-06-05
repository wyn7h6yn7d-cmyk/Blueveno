"use client";

import { FileText, ImageIcon } from "lucide-react";
import { StatusPill } from "@/components/v2/data";
import { PnlCell } from "@/components/v2/tables";
import type { TradeRow } from "@/lib/trades/map-trade-row";
import { cn } from "@/lib/utils";
import { v2TableRow } from "@/lib/ui/v2-surface";

type TradesMobileCardsProps = {
  rows: TradeRow[];
  currency: string;
  onRowOpen: (row: TradeRow) => void;
};

function MetaPill({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <StatusPill tone="neutral" size="sm">
      <span className="text-zinc-500">{label}:</span> {value}
    </StatusPill>
  );
}

export function TradesMobileCards({ rows, currency, onRowOpen }: TradesMobileCardsProps) {
  return (
    <div className="space-y-2 md:hidden">
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onRowOpen(row)}
          className={cn(
            v2TableRow,
            "flex w-full flex-col gap-2 rounded-xl border border-white/[0.06] p-3 text-left transition hover:border-white/[0.1] hover:bg-white/[0.03]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-zinc-100">{row.symbol}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {row.entryDateLabel} · {row.accountName}
              </p>
            </div>
            <PnlCell value={row.pnl} currency={currency} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <MetaPill label="Setup" value={row.setup !== "—" ? row.setup : null} />
            <MetaPill label="Mood" value={row.mood} />
            <MetaPill label="Session" value={row.session} />
            {row.disciplineScore !== null ? (
              <StatusPill tone={row.disciplineScore >= 70 ? "success" : row.disciplineScore < 50 ? "warning" : "neutral"} size="sm">
                Discipline {row.disciplineScore}%
              </StatusPill>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            {row.hasChart ? (
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="size-3" aria-hidden />
                Chart
              </span>
            ) : null}
            {row.hasNotes ? (
              <span className="inline-flex items-center gap-1">
                <FileText className="size-3" aria-hidden />
                Notes
              </span>
            ) : null}
            {row.mistakeTag ? <span>Mistake: {row.mistakeTag}</span> : null}
          </div>
        </button>
      ))}
    </div>
  );
}
