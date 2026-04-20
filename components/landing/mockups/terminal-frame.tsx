type TerminalFrameProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
};

export function TerminalFrame({ children, title, className = "" }: TerminalFrameProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[oklch(0.1_0.025_265)] shadow-[0_0_0_1px_oklch(1_0_0_/0.03),0_32px_100px_-40px_oklch(0.2_0.15_260/0.9),0_0_120px_-50px_oklch(0.55_0.2_250/0.25)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.45_0.15_250/0.12),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.15 250 / 0.08), transparent 40%, oklch(0.45 0.1 270 / 0.06))",
        }}
      />
      <header className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        <span className="truncate text-zinc-400">{title}</span>
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-emerald-500/30" />
        </span>
      </header>
      <div className="relative">{children}</div>
    </div>
  );
}
