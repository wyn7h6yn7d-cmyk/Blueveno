type MockupFrameProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
};

export function MockupFrame({ children, label, className = "" }: MockupFrameProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090e] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_80px_-24px_rgba(0,0,0,0.85)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-radial-fade opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(94,234,212,0.12), transparent 42%, rgba(167,139,250,0.08))",
        }}
      />
      {label ? (
        <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <span>{label}</span>
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/40" />
          </span>
        </div>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
