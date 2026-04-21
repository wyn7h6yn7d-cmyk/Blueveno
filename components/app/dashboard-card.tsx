import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
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
        "flex flex-col overflow-hidden rounded-2xl border border-white/[0.085]",
        "bg-[linear-gradient(168deg,oklch(0.14_0.028_262/0.97),oklch(0.108_0.026_264/0.96))]",
        "shadow-[0_22px_64px_-36px_rgba(0,0,0,0.75),inset_0_1px_0_0_oklch(1_0_0_/0.04)] ring-1 ring-white/[0.035]",
        variant === "inset" &&
          "bg-[linear-gradient(172deg,oklch(0.118_0.03_264/0.95),oklch(0.095_0.028_266/0.94))] ring-white/[0.025]",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header className="border-b border-white/[0.065] px-5 py-4 sm:px-6 sm:py-5">
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
      <div className="min-h-0 flex-1 p-5 sm:p-6">{children}</div>
      {footer ? (
        <footer className="border-t border-white/[0.06] bg-black/15 px-5 py-3.5 sm:px-6">{footer}</footer>
      ) : null}
    </section>
  );
}
