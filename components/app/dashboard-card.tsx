import type { ReactNode } from "react";
import { appEyebrow } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Main content area (below header) — e.g. flush calendar grids */
  contentClassName?: string;
  variant?: "default" | "inset" | "featured";
  footer?: ReactNode;
};

const variantClass: Record<NonNullable<DashboardCardProps["variant"]>, string> = {
  default: cn(
    "border-white/[0.07]",
    "bg-[linear-gradient(168deg,oklch(0.155_0.034_262/0.97),oklch(0.115_0.028_264/0.96))]",
    "shadow-[0_26px_72px_-38px_rgba(0,0,0,0.8),0_0_84px_-52px_oklch(0.52_0.13_252/0.18),inset_0_1px_0_0_oklch(1_0_0_/0.055)]",
  ),
  inset: cn(
    "border-white/[0.06]",
    "bg-[linear-gradient(172deg,oklch(0.13_0.032_264/0.95),oklch(0.102_0.03_266/0.94))]",
    "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04),0_16px_48px_-36px_rgba(0,0,0,0.65)]",
  ),
  featured: cn(
    "border-[oklch(0.55_0.12_252/0.34)]",
    "bg-[linear-gradient(158deg,oklch(0.19_0.05_258/0.97),oklch(0.105_0.032_264/0.98))]",
    "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1),0_32px_64px_-36px_oklch(0.5_0.16_252/0.42)] ring-1 ring-[oklch(0.58_0.1_252/0.2)]",
  ),
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
    <section className={cn("flex flex-col overflow-hidden rounded-2xl border", variantClass[variant], className)}>
      {(eyebrow || title || description) && (
        <header className="border-b border-white/[0.06] px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-1.5">
            {eyebrow ? <p className={appEyebrow}>{eyebrow}</p> : null}
            {title ? (
              <div className="font-display text-[1.08rem] font-semibold leading-snug tracking-[-0.02em] text-zinc-50 sm:text-lg">
                {title}
              </div>
            ) : null}
            {description ? <p className="text-[14px] leading-relaxed text-zinc-400/95">{description}</p> : null}
          </div>
        </header>
      )}
      <div className={cn("min-h-0 min-w-0 flex-1 p-4 sm:p-5", contentClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-white/[0.06] bg-black/15 px-4 py-3 sm:px-6 sm:py-3.5">{footer}</footer>
      ) : null}
    </section>
  );
}
