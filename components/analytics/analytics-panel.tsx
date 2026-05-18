import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { appCardSecondary } from "@/lib/ui/app-surface";

type AnalyticsPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  glow?: "blue" | "green" | "red" | "none";
};

const glowClass = {
  blue: "shadow-[0_0_48px_-28px_oklch(0.48_0.14_252/0.55)]",
  green: "shadow-[0_0_48px_-28px_oklch(0.42_0.16_155/0.45)]",
  red: "shadow-[0_0_48px_-28px_oklch(0.42_0.18_15/0.4)]",
  none: "",
} as const;

export function AnalyticsPanel({
  title,
  description,
  children,
  className,
  contentClassName,
  glow = "blue",
}: AnalyticsPanelProps) {
  return (
    <section
      className={cn(
        appCardSecondary,
        "overflow-hidden px-5 py-5 sm:px-6 sm:py-6",
        glowClass[glow],
        className,
      )}
    >
      <header className="mb-5 max-w-2xl">
        <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-zinc-50 sm:text-[1.15rem]">
          {title}
        </h3>
        {description ? (
          <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500">{description}</p>
        ) : null}
      </header>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </section>
  );
}
