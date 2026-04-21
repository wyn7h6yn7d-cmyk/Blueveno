import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  /** `signature` — larger title for Calendar / Stats hero surfaces */
  variant?: "default" | "signature";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  variant = "default",
}: PageHeaderProps) {
  const isSig = variant === "signature";

  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        isSig && "pb-9",
        className,
      )}
    >
      <div className="min-w-0 space-y-3">
        {eyebrow ? (
          <>
            <p
              className={cn(
                "font-mono uppercase tracking-[0.22em]",
                isSig ? "text-[11px] text-[oklch(0.72_0.1_252)]" : "text-[10px] text-[oklch(0.58_0.1_252)]",
              )}
            >
              {eyebrow}
            </p>
            <div className="h-px w-12 rounded-full bg-[linear-gradient(90deg,oklch(0.55_0.12_252/0.45),transparent)]" />
          </>
        ) : null}
        <h1
          className={cn(
            "font-display font-semibold tracking-[-0.035em] text-zinc-50",
            isSig ? "text-[1.75rem] leading-[1.15] md:text-[2rem]" : "text-[1.4rem] leading-tight md:text-[1.55rem]",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "max-w-xl leading-[1.6] text-zinc-400",
              isSig ? "text-[15px] md:text-base" : "text-sm md:text-[15px]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5 pt-1 sm:pt-0">{actions}</div>
      ) : null}
    </div>
  );
}
