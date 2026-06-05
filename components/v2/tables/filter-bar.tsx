import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2FilterPill, v2FilterPillActive, v2Toolbar } from "@/lib/ui/v2-surface";

export type FilterBarOption = {
  id: string;
  label: string;
  count?: number;
};

type FilterBarProps = {
  options: FilterBarOption[];
  value: string;
  onChange: (id: string) => void;
  trailing?: ReactNode;
  className?: string;
};

export function FilterBar({ options, value, onChange, trailing, className }: FilterBarProps) {
  return (
    <div className={cn(v2Toolbar, "flex-wrap", className)} role="toolbar" aria-label="Filters">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={active ? v2FilterPillActive : v2FilterPill}
              aria-pressed={active}
            >
              <span>{opt.label}</span>
              {opt.count !== undefined ? (
                <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-400">
                  {opt.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
    </div>
  );
}
