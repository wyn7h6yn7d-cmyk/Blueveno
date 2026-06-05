"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ImageIcon } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { CompactCell, PnlCell, RowActionsCell, TagCell } from "@/components/v2/tables";
import { StatusPill } from "@/components/v2/data";
import {
  DataTable,
  sortDataTableRows,
  type DataTableColumn,
  type DataTableSortDir,
} from "@/components/v2/ui/data-table";
import { EmptyState } from "@/components/v2/design-system";
import type { TradeRow } from "@/lib/trades/map-trade-row";

type TradesTableProps = {
  rows: TradeRow[];
  currency: string;
  loading?: boolean;
  onRowOpen: (row: TradeRow) => void;
  hasAnyEntries: boolean;
};

function IndicatorDot({ active, label, icon: Icon }: { active: boolean; label: string; icon: typeof FileText }) {
  if (!active) return <span className="text-[12px] text-zinc-700">—</span>;
  return (
    <StatusPill tone="info" size="sm" className="gap-1 px-1.5">
      <Icon className="size-3" aria-hidden />
      <span className="sr-only">{label}</span>
    </StatusPill>
  );
}

function disciplineTone(score: number | null): "neutral" | "success" | "warning" {
  if (score === null) return "neutral";
  if (score >= 70) return "success";
  if (score < 50) return "warning";
  return "neutral";
}

export function TradesTable({ rows, currency, loading = false, onRowOpen, hasAnyEntries }: TradesTableProps) {
  const router = useRouter();
  const { canWriteJournal } = useAccess();
  const [sortColumnId, setSortColumnId] = useState<string | null>("date");
  const [sortDirection, setSortDirection] = useState<DataTableSortDir>("desc");

  const columns: DataTableColumn<TradeRow>[] = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        cell: (row) => <CompactCell primary={row.entryDateLabel} secondary={row.entryTime} />,
        sortable: true,
        sortValue: (row) => row.entryDate,
      },
      {
        id: "account",
        header: "Account",
        cell: (row) => <CompactCell primary={row.accountName} secondary={row.accountType ?? undefined} />,
        sortable: true,
        sortValue: (row) => row.accountName,
      },
      {
        id: "symbol",
        header: "Symbol",
        cell: (row) => <span className="font-medium text-zinc-100">{row.symbol}</span>,
        sortable: true,
        sortValue: (row) => row.symbol,
      },
      {
        id: "pnl",
        header: "P&L",
        cell: (row) => <PnlCell value={row.pnl} currency={currency} />,
        sortable: true,
        sortValue: (row) => row.pnl ?? 0,
      },
      {
        id: "mood",
        header: "Mood",
        cell: (row) =>
          row.mood ? (
            <StatusPill tone="info" size="sm">
              {row.mood}
            </StatusPill>
          ) : (
            <span className="text-[12px] text-zinc-600">—</span>
          ),
        sortable: true,
        sortValue: (row) => row.mood,
      },
      {
        id: "setup",
        header: "Setup",
        cell: (row) => <TagCell tags={row.setup !== "—" ? [row.setup] : []} max={1} tone="neutral" />,
        sortable: true,
        sortValue: (row) => row.setup,
      },
      {
        id: "mistake",
        header: "Mistake",
        cell: (row) =>
          row.mistakeTag ? (
            <StatusPill tone="warning" size="sm">
              {row.mistakeTag}
            </StatusPill>
          ) : (
            <span className="text-[12px] text-zinc-600">—</span>
          ),
        sortable: true,
        sortValue: (row) => row.mistakeTag,
      },
      {
        id: "session",
        header: "Session",
        cell: (row) =>
          row.session ? (
            <StatusPill tone="neutral" size="sm">
              {row.session}
            </StatusPill>
          ) : (
            <span className="text-[12px] text-zinc-600">—</span>
          ),
        sortable: true,
        sortValue: (row) => row.session,
      },
      {
        id: "market",
        header: "Market",
        cell: (row) =>
          row.marketCondition ? (
            <StatusPill tone="neutral" size="sm">
              {row.marketCondition}
            </StatusPill>
          ) : (
            <span className="text-[12px] text-zinc-600">—</span>
          ),
        sortable: true,
        sortValue: (row) => row.marketCondition,
      },
      {
        id: "discipline",
        header: "Discipline",
        cell: (row) =>
          row.disciplineScore !== null ? (
            <StatusPill tone={disciplineTone(row.disciplineScore)} size="sm">
              {row.disciplineScore}%
            </StatusPill>
          ) : (
            <span className="text-[12px] text-zinc-600">—</span>
          ),
        sortable: true,
        sortValue: (row) => row.disciplineScore ?? -1,
      },
      {
        id: "chart",
        header: "Chart",
        cell: (row) => <IndicatorDot active={row.hasChart} label="Chart linked" icon={ImageIcon} />,
      },
      {
        id: "notes",
        header: "Notes",
        cell: (row) => <IndicatorDot active={row.hasNotes} label="Has notes" icon={FileText} />,
      },
      {
        id: "actions",
        header: "",
        cell: (row) => (
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <RowActionsCell
              actions={[
                { id: "open", label: "Quick view", onSelect: () => onRowOpen(row) },
                { id: "detail", label: "Open detail", onSelect: () => router.push(`/app/trades/${row.id}`) },
                ...(canWriteJournal
                  ? [{ id: "edit", label: "Edit entry", onSelect: () => router.push(`/app/journal/${row.id}/edit`) }]
                  : []),
              ]}
            />
          </div>
        ),
        className: "w-12",
      },
    ],
    [currency, onRowOpen, router, canWriteJournal],
  );

  const sortedRows = useMemo(
    () => sortDataTableRows(rows, columns, sortColumnId, sortDirection),
    [rows, columns, sortColumnId, sortDirection],
  );

  const onSort = (columnId: string) => {
    if (sortColumnId === columnId) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumnId(columnId);
    setSortDirection("desc");
  };

  return (
    <div className="hidden overflow-x-auto md:block">
      <DataTable
        columns={columns}
        rows={sortedRows}
        getRowKey={(row) => row.id}
        loading={loading}
        sortColumnId={sortColumnId}
        sortDirection={sortDirection}
        onSort={onSort}
        onRowClick={onRowOpen}
        empty={
          <EmptyState
            title={hasAnyEntries ? "No trades match these filters" : "No trades yet"}
            description={
              hasAnyEntries
                ? "Try widening the date range or clearing filters."
                : "Log your first trading day in Journal to populate this table."
            }
            compact
          />
        }
      />
    </div>
  );
}
