import { PnlCell } from "@/components/v2/tables/pnl-cell";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/v2/ui/data-table";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import type { BreakdownRow } from "@/lib/stats/analytics-v2-transforms";

type AnalyticsBreakdownTableProps = {
  rows: BreakdownRow[];
  currency: string;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
};

export function AnalyticsBreakdownTable({
  rows,
  currency,
  emptyTitle = "No breakdown data",
  emptyDescription = "Log more tagged entries to populate this table.",
  loading = false,
}: AnalyticsBreakdownTableProps) {
  const columns: DataTableColumn<BreakdownRow>[] = [
    {
      id: "label",
      header: "Label",
      cell: (row) => <span className="font-medium text-zinc-200">{row.label}</span>,
      sortable: true,
      sortValue: (row) => row.label,
    },
    {
      id: "count",
      header: "Count",
      cell: (row) => <span className="font-mono text-[12px] tabular-nums">{row.count}</span>,
      sortable: true,
      sortValue: (row) => row.count,
    },
    {
      id: "winRate",
      header: "Win %",
      cell: (row) => (
        <span className="font-mono text-[12px] tabular-nums text-zinc-400">
          {row.winRate !== null ? `${row.winRate}%` : "—"}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.winRate,
    },
    {
      id: "total",
      header: "Total P&L",
      cell: (row) => <PnlCell value={row.totalPnl} currency={currency} />,
      sortable: true,
      sortValue: (row) => row.totalPnl,
    },
    {
      id: "avg",
      header: "Avg",
      cell: (row) => <PnlCell value={row.avgResult} currency={currency} />,
      sortable: true,
      sortValue: (row) => row.avgResult,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      loading={loading}
      empty={<EmptyStatePanel title={emptyTitle} description={emptyDescription} compact />}
    />
  );
}
