import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2Eyebrow, v2ModuleTitle, v2Supporting } from "@/lib/ui/v2-surface";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  className?: string;
  dense?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  dense = false,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        dense ? "gap-1.5" : "gap-2",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? <p className={v2Eyebrow}>{eyebrow}</p> : null}
        <h2 className={cn(v2ModuleTitle, dense ? "text-[0.95rem]" : "text-[1.05rem] sm:text-[1.1rem]")}>
          {title}
        </h2>
        {description ? <p className={v2Supporting}>{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
