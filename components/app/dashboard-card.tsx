import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Chrome variant: default panel vs inset chart well */
  variant?: "default" | "inset";
  footer?: ReactNode;
};

export function DashboardCard({
  eyebrow,
  title,
  description,
  children,
  className,
  variant = "default",
  footer,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/90 bg-bv-surface/95 shadow-bv-card",
        variant === "inset" && "bg-bv-surface-inset/80",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header className="border-b border-border/80 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-1">
            {eyebrow ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
            ) : null}
            {title ? (
              <div className="font-display text-[15px] font-medium leading-snug text-zinc-100">{title}</div>
            ) : null}
            {description ? <p className="text-xs leading-relaxed text-zinc-500">{description}</p> : null}
          </div>
        </header>
      )}
      <div className="min-h-0 flex-1 p-4 sm:p-5">{children}</div>
      {footer ? (
        <footer className="border-t border-border/80 bg-bv-surface-inset/40 px-4 py-3 sm:px-5">{footer}</footer>
      ) : null}
    </section>
  );
}
