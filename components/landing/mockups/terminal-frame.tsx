import { cn } from "@/lib/utils";

type TerminalFrameProps = {
  children: React.ReactNode;
  title: string;
  /** Optional workspace / route context — reads like real product chrome */
  subtitle?: string;
  className?: string;
  /** Hero mockup uses stronger rim light; deep-dive panels stay restrained. */
  variant?: "panel" | "hero";
};

export function TerminalFrame({
  children,
  title,
  subtitle,
  className = "",
  variant = "panel",
}: TerminalFrameProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-bv-surface",
        variant === "hero"
          ? "border border-white/[0.14] shadow-hero-mock"
          : "border border-white/[0.08] shadow-bv-float ring-1 ring-primary/[0.06]",
        className,
      )}
    >
      {variant !== "hero" ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_60%_at_50%_-30%,oklch(0.42_0.11_252/0.18),transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-px rounded-[0.9375rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.52 0.11 252 / 0.06), transparent 42%, oklch(0.4 0.09 258 / 0.04))",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
        />
      )}
      <header
        className={cn(
          "relative flex items-center justify-between gap-3 border-b px-4 py-2.5",
          variant === "hero"
            ? "border-white/[0.1] bg-black/55"
            : "border-border/70 bg-black/20 backdrop-blur-[2px]",
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.22em]",
              variant === "hero" ? "text-zinc-300" : "text-zinc-400",
            )}
          >
            {title}
          </p>
          {subtitle ? (
            <p
              className={cn(
                "mt-0.5 truncate font-mono text-[9px] tracking-[0.02em] normal-case",
                variant === "hero" ? "text-zinc-500" : "text-zinc-600",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <span className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-[oklch(0.45_0.08_25/0.9)] ring-1 ring-white/[0.08]" />
          <span className="size-2 rounded-full bg-[oklch(0.65_0.12_85/0.85)] ring-1 ring-white/[0.08]" />
          <span className="size-2 rounded-full bg-[oklch(0.55_0.12_145/0.55)] ring-1 ring-white/[0.08]" />
        </span>
      </header>
      <div className="relative">{children}</div>
    </div>
  );
}
