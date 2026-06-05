import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2Eyebrow, v2Supporting } from "@/lib/ui/v2-surface";

type PageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
  variant?: "default" | "signature";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
  variant = "default",
}: PageHeaderProps) {
  const isSig = variant === "signature";

  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-white/[0.06] sm:flex-row sm:items-end sm:justify-between",
        isSig ? "pb-6 sm:pb-7" : "pb-5 sm:pb-6",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <>
            <p className={v2Eyebrow}>{eyebrow}</p>
            <div className="h-px w-12 rounded-full bg-[linear-gradient(90deg,oklch(0.55_0.12_252/0.4),transparent)]" />
          </>
        ) : null}
        <h1
          className={cn(
            "font-display font-semibold tracking-[-0.03em] text-zinc-50",
            isSig ? "text-[1.75rem] leading-[1.12] md:text-[2rem]" : "text-[1.4rem] leading-tight md:text-[1.55rem]",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              v2Supporting,
              "max-w-2xl text-[13px] leading-relaxed",
              isSig && "text-zinc-400",
            )}
          >
            {description}
          </p>
        ) : null}
        {meta ? <div className="pt-1">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>
      ) : null}
    </header>
  );
}
