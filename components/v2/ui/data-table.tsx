import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { v2MonoMeta, v2TableHeader, v2TableRow } from "@/lib/ui/v2-surface";

export type DataTableSortDir = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  sortColumnId?: string | null;
  sortDirection?: DataTableSortDir;
  onSort?: (columnId: string) => void;
  rowClassName?: (row: T) => string | undefined;
  onRowClick?: (row: T) => void;
};

function SortIcon({ active, direction }: { active: boolean; direction: DataTableSortDir }) {
  if (!active) return <ArrowUpDown className="size-3 opacity-40" aria-hidden />;
  return direction === "asc" ? (
    <ArrowUp className="size-3" aria-hidden />
  ) : (
    <ArrowDown className="size-3" aria-hidden />
  );
}

function DataTableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="space-y-2 p-3" aria-busy="true">
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: columns }).map((__, col) => (
            <Skeleton key={col} className="h-8 flex-1 rounded-md bg-white/[0.05]" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  empty,
  className,
  stickyHeader = true,
  sortColumnId = null,
  sortDirection = "asc",
  onSort,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("overflow-hidden rounded-lg border border-white/[0.07]", className)}>
        <DataTableSkeleton columns={Math.max(columns.length, 3)} />
      </div>
    );
  }

  if (rows.length === 0 && empty) {
    return (
      <div className={cn("overflow-hidden rounded-lg border border-white/[0.07]", className)}>
        {empty}
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-white/[0.07]", className)}>
      <table className="w-full min-w-[32rem] border-collapse text-left text-[13px]">
        <thead className={cn(v2TableHeader, stickyHeader && "sticky top-0 z-10 backdrop-blur-sm")}>
          <tr>
            {columns.map((col) => {
              const isActive = sortColumnId === col.id;
              const canSort = col.sortable && onSort;
              return (
                <th
                  key={col.id}
                  scope="col"
                  className={cn(
                    "px-3 py-2.5 font-medium text-zinc-400 first:pl-4 last:pr-4",
                    col.headerClassName,
                  )}
                >
                  {canSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.id)}
                      className="inline-flex items-center gap-1.5 text-left transition hover:text-zinc-200"
                    >
                      <span className={v2MonoMeta}>{col.header}</span>
                      <SortIcon active={isActive} direction={isActive ? sortDirection : "asc"} />
                    </button>
                  ) : (
                    <span className={v2MonoMeta}>{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={cn(v2TableRow, onRowClick && "cursor-pointer", rowClassName?.(row))}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={cn(
                    "px-3 py-2.5 text-zinc-200 first:pl-4 last:pr-4",
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sort rows client-side using column sortValue */
export function sortDataTableRows<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  sortColumnId: string | null,
  direction: DataTableSortDir,
): T[] {
  if (!sortColumnId) return rows;
  const col = columns.find((c) => c.id === sortColumnId);
  if (!col?.sortValue) return rows;

  const sorted = [...rows].sort((a, b) => {
    const av = col.sortValue!(a);
    const bv = col.sortValue!(b);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv));
  });

  return direction === "desc" ? sorted.reverse() : sorted;
}
