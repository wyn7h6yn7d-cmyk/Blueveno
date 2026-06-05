import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2MonoMeta } from "@/lib/ui/v2-surface";

export type SortDirection = "asc" | "desc";

type SortableHeaderProps = {
  children: ReactNode;
  active?: boolean;
  direction?: SortDirection;
  onSort?: () => void;
  className?: string;
};

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown className="size-3 opacity-40" aria-hidden />;
  return direction === "asc" ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />;
}

export function SortableHeader({
  children,
  active = false,
  direction = "asc",
  onSort,
  className,
}: SortableHeaderProps) {
  if (!onSort) {
    return <span className={cn(v2MonoMeta, className)}>{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "inline-flex items-center gap-1.5 text-left transition hover:text-zinc-200",
        active ? "text-zinc-200" : "text-zinc-500",
        className,
      )}
    >
      <span className={v2MonoMeta}>{children}</span>
      <SortIcon active={active} direction={direction} />
    </button>
  );
}
