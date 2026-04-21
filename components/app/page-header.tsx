import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-white/[0.07] pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0 space-y-2.5">
        {eyebrow ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[oklch(0.62_0.11_252)]">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-[1.4rem] font-semibold tracking-[-0.03em] text-zinc-50 md:text-[1.55rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm leading-[1.6] text-zinc-400 md:text-[15px]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:pt-0">{actions}</div> : null}
    </div>
  );
}
