import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Main content area (below header) — e.g. flush calendar grids */
  contentClassName?: string;
  variant?: "default" | "inset";
  footer?: ReactNode;
};

export function DashboardCard({
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
  variant = "default",
  footer,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-white/[0.11]",
        "bg-[linear-gradient(168deg,oklch(0.155_0.032_262/0.97),oklch(0.115_0.028_264/0.96))]",
        "shadow-[0_26px_72px_-38px_rgba(0,0,0,0.8),0_0_84px_-52px_oklch(0.52_0.13_252/0.22),inset_0_1px_0_0_oklch(1_0_0_/0.055)] ring-1 ring-white/[0.05]",
        variant === "inset" &&
          "bg-[linear-gradient(172deg,oklch(0.13_0.032_264/0.95),oklch(0.102_0.03_266/0.94))] ring-white/[0.03]",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header className="border-b border-white/[0.08] px-4 py-4 sm:px-6 sm:py-5.5">
          <div className="flex flex-col gap-1">
            {eyebrow ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>
            ) : null}
            {title ? (
              <div className="font-display text-[1.05rem] font-medium leading-snug tracking-[-0.02em] text-zinc-50 sm:text-lg">
                {title}
              </div>
            ) : null}
            {description ? <p className="text-[13px] leading-relaxed text-zinc-500">{description}</p> : null}
          </div>
        </header>
      )}
      <div className={cn("min-h-0 min-w-0 flex-1 p-5.5 sm:p-6.5", contentClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-white/[0.06] bg-black/15 px-4 py-3 sm:px-6 sm:py-3.5">{footer}</footer>
      ) : null}
    </section>
  );
}
