import type { ReactNode } from "react";
import { appCardShell, appEyebrow } from "@/lib/ui/app-surface";
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
  default: appCardShell,
  inset: cn(
    appCardShell,
    "border-white/[0.06]",
    "bg-[linear-gradient(172deg,oklch(0.125_0.024_264/0.95),oklch(0.098_0.02_266/0.94))]",
  ),
  featured: cn(
    appCardShell,
    "border-[oklch(0.55_0.12_252/0.22)]",
    "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.07),0_28px_64px_-38px_rgba(0,0,0,0.78),0_0_48px_-40px_oklch(0.48_0.11_252/0.22)]",
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
    <section className={cn("flex flex-col overflow-hidden", variantClass[variant], className)}>
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
        <footer className="border-t border-white/[0.06] bg-black/10 px-4 py-3 sm:px-6 sm:py-3.5">{footer}</footer>
      ) : null}
    </section>
  );
}
