import { cn } from "@/lib/utils";
import type { JournalRow } from "@/components/dashboard/types";

const defaultRows: JournalRow[] = [
  {
    id: "1",
    time: "09:44:02",
    symbol: "ES",
    side: "Long",
    setup: "ORB",
    size: "2",
    rMultiple: "+0.50",
    slippage: "0.25t",
    note: "Entry on retest",
  },
  {
    id: "2",
    time: "10:12:18",
    symbol: "NQ",
    side: "Short",
    setup: "Fade",
    size: "1",
    rMultiple: "+0.80",
    slippage: "—",
    note: "News off",
  },
  {
    id: "3",
    time: "11:03:41",
    symbol: "ES",
    side: "Flat",
    setup: "Scratch",
    size: "2",
    rMultiple: "−0.10",
    slippage: "1.0t",
    note: "No follow-through",
  },
  {
    id: "4",
    time: "13:22:09",
    symbol: "CL",
    side: "Long",
    setup: "VWAP",
    size: "1",
    rMultiple: "+0.35",
    slippage: "0.5t",
    note: "Partial +1R",
  },
];

type JournalTableProps = {
  rows?: JournalRow[];
  onRowClick?: (row: JournalRow) => void;
  className?: string;
};

export function JournalTable({ rows = defaultRows, onRowClick, className }: JournalTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-white/[0.06]", className)}>
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-bv-surface-inset/85 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            <th scope="col" className="sticky left-0 z-10 bg-bv-surface-inset/95 px-4 py-3 backdrop-blur-sm">
              Time
            </th>
            <th scope="col" className="px-4 py-3">
              Sym
            </th>
            <th scope="col" className="px-4 py-3">
              Side
            </th>
            <th scope="col" className="px-4 py-3">
              Setup
            </th>
            <th scope="col" className="px-4 py-3 text-right tabular-nums">
              Sz
            </th>
            <th scope="col" className="px-4 py-3 text-right tabular-nums">
              R
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Slip
            </th>
            <th scope="col" className="px-4 py-3">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-white/[0.04] transition-colors",
                onRowClick ? "cursor-pointer hover:bg-white/[0.04]" : "hover:bg-white/[0.02]",
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <td className="sticky left-0 z-10 bg-bv-surface/97 px-4 py-2.5 font-mono text-xs text-zinc-400 backdrop-blur-sm">
                {row.time}
              </td>
              <td className="px-4 py-2.5 font-medium text-zinc-100">{row.symbol}</td>
              <td className="px-4 py-2.5 text-zinc-400">{row.side}</td>
              <td className="px-4 py-2.5">
                <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                  {row.setup}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-400">{row.size}</td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-100">{row.rMultiple}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-500">{row.slippage}</td>
              <td className="max-w-[220px] px-4 py-2.5 text-zinc-500">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
