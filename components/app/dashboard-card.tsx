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
        "flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.135_0.028_262/0.95),oklch(0.11_0.028_264/0.94))] shadow-bv-card",
        variant === "inset" && "bg-[linear-gradient(170deg,oklch(0.11_0.03_264/0.92),oklch(0.09_0.03_266/0.92))]",
        className,
      )}
    >
      {(eyebrow || title || description) && (
        <header className="border-b border-white/[0.08] px-5 py-4">
          <div className="flex flex-col gap-1">
            {eyebrow ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
            ) : null}
            {title ? (
              <div className="font-display text-[17px] font-medium leading-snug text-zinc-100">{title}</div>
            ) : null}
            {description ? <p className="text-sm leading-relaxed text-zinc-500">{description}</p> : null}
          </div>
        </header>
      )}
      <div className="min-h-0 flex-1 p-5">{children}</div>
      {footer ? (
        <footer className="border-t border-white/[0.08] bg-bv-surface-inset/40 px-5 py-3">{footer}</footer>
      ) : null}
    </section>
  );
}
