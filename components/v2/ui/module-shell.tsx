import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { v2Eyebrow, v2ModuleShell, v2ModuleTitle, v2Supporting } from "@/lib/ui/v2-surface";

type ModuleShellProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  loading?: boolean;
  /** Shown when not loading and children is null/undefined */
  empty?: ReactNode;
};

function ModuleShellSkeleton() {
  return (
    <div className="space-y-4 p-4 sm:p-5" aria-busy="true">
      <Skeleton className="h-3 w-24 rounded-md bg-white/[0.06]" />
      <Skeleton className="h-5 w-40 rounded-md bg-white/[0.08]" />
      <Skeleton className="h-32 w-full rounded-lg bg-white/[0.05]" />
    </div>
  );
}

export function ModuleShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  footer,
  className,
  contentClassName,
  loading = false,
  empty,
}: ModuleShellProps) {
  const hasHeader = eyebrow || title || description || actions;
  const showEmpty = !loading && !children && empty;

  return (
    <section className={cn("flex flex-col overflow-hidden", v2ModuleShell, className)}>
      {hasHeader ? (
        <header className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-3.5">
          <div className="min-w-0 flex-1 space-y-1">
            {eyebrow ? <p className={v2Eyebrow}>{eyebrow}</p> : null}
            {title ? <div className={v2ModuleTitle}>{title}</div> : null}
            {description ? <p className={v2Supporting}>{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}

      {loading ? (
        <ModuleShellSkeleton />
      ) : showEmpty ? (
        <div className={cn("min-h-0 min-w-0 flex-1 p-4 sm:p-5", contentClassName)}>{empty}</div>
      ) : children ? (
        <div className={cn("min-h-0 min-w-0 flex-1 p-4 sm:p-5", contentClassName)}>{children}</div>
      ) : null}

      {footer && !loading ? (
        <footer className="border-t border-white/[0.06] bg-black/10 px-4 py-2.5 sm:px-5 sm:py-3">{footer}</footer>
      ) : null}
    </section>
  );
}
