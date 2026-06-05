import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2MonoMeta, v2Supporting } from "@/lib/ui/v2-surface";

type CompactCellProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function CompactCell({ primary, secondary, meta, className }: CompactCellProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="truncate font-medium text-zinc-100">{primary}</div>
      {secondary ? <div className={cn(v2Supporting, "truncate")}>{secondary}</div> : null}
      {meta ? <div className={cn(v2MonoMeta, "mt-0.5 truncate normal-case")}>{meta}</div> : null}
    </div>
  );
}
