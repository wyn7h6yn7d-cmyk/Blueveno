import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProductShowcaseFrameProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Premium workstation frame — layered rim, cobalt bloom, showcase shadow.
 */
export function ProductShowcaseFrame({ children, className }: ProductShowcaseFrameProps) {
  return (
    <div className={cn("group/frame relative min-w-0", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-[1.45rem] bg-[radial-gradient(ellipse_75%_65%_at_50%_38%,oklch(0.44_0.12_252/0.2),transparent_60%)] blur-3xl transition-opacity duration-700 group-hover/frame:opacity-100 sm:-inset-6"
      />
      <div className="relative rounded-[1.2rem] border border-white/[0.1] bg-bv-surface-inset/30 p-1 shadow-bv-showcase ring-1 ring-primary/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.2] to-transparent" />
        <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-60" />
        <div className="relative overflow-hidden rounded-[1.06rem] border border-border/55 bg-gradient-to-b from-bv-void/50 to-bv-void/90">
          <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-[0.14]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent opacity-80" aria-hidden />
          <div className="relative z-[1]">{children}</div>
        </div>
      </div>
    </div>
  );
}
