import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2Supporting, v2Toolbar } from "@/lib/ui/v2-surface";

type DataTableToolbarProps = {
  left?: ReactNode;
  right?: ReactNode;
  summary?: string;
  className?: string;
};

export function DataTableToolbar({ left, right, summary, className }: DataTableToolbarProps) {
  return (
    <div className={cn(v2Toolbar, "justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{left}</div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {summary ? <span className={v2Supporting}>{summary}</span> : null}
        {right}
      </div>
    </div>
  );
}
