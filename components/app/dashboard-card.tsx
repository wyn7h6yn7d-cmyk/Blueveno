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
        "flex flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(165deg,oklch(0.138_0.026_262/0.96),oklch(0.112_0.026_264/0.95))] shadow-bv-card ring-1 ring-white/[0.03]",
        variant === "inset" &&
          "bg-[linear-gradient(172deg,oklch(0.115_0.028_264/0.94),oklch(0.092_0.028_266/0.93))] ring-white/[0.02]",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header className="border-b border-white/[0.06] px-6 py-5">
          <div className="flex flex-col gap-1.5">
            {eyebrow ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>
            ) : null}
            {title ? (
              <div className="font-display text-lg font-medium leading-snug tracking-tight text-zinc-50">{title}</div>
            ) : null}
            {description ? <p className="text-sm leading-relaxed text-zinc-500">{description}</p> : null}
          </div>
        </header>
      )}
      <div className="min-h-0 flex-1 p-6">{children}</div>
      {footer ? (
        <footer className="border-t border-white/[0.06] bg-bv-surface-inset/35 px-6 py-3.5">{footer}</footer>
      ) : null}
    </section>
  );
}
