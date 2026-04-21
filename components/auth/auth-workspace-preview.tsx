type AuthWorkspacePreviewProps = {
  variant: "login" | "signup";
};

const BAR_HEIGHTS = [38, 44, 41, 52, 48, 55, 50, 58, 62, 56, 64, 59, 68, 72, 66, 74];

/**
 * Read-only workstation mock for auth aside — dashboard-adjacent, not decorative noise.
 */
export function AuthWorkspacePreview({ variant }: AuthWorkspacePreviewProps) {
  const isSignup = variant === "signup";

  return (
    <div className="border-glow-subtle relative overflow-hidden rounded-[1.15rem]">
      <div className="absolute inset-px rounded-[1.1rem] bg-gradient-to-b from-bv-surface-high/50 via-bv-surface/75 to-bv-surface-inset/90" />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2 rounded-full bg-[oklch(0.52_0.14_25)]" />
              <span className="size-2 rounded-full bg-[oklch(0.72_0.12_88)]" />
              <span className="size-2 rounded-full bg-[oklch(0.48_0.12_152)]" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {isSignup ? "Workspace" : "Session"}
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                {isSignup ? "Provisioning preview · west-1" : "Encrypted · TLS 1.3"}
              </span>
            </div>
          </div>
          <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            read-only
          </span>
        </div>

        <div className="px-4 pb-2 pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              Equity · 5m
            </p>
            <p className="font-mono text-[11px] tabular-nums text-bv-ice/90">
              +0.42<span className="text-zinc-600">R</span>
            </p>
          </div>
          <div
            className="mt-3 grid h-24 grid-cols-[repeat(16,minmax(0,1fr))] gap-px"
            aria-hidden
          >
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="flex items-end justify-center">
                <div
                  className="w-full rounded-[2px] bg-gradient-to-t from-bv-blue-deep/35 via-primary/45 to-[oklch(0.78_0.1_250_/_0.55)]"
                  style={{ height: `${(h / 100) * 96}px` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-px border-t border-white/[0.06] bg-white/[0.04] sm:grid-cols-2">
          <div className="bg-bv-surface/60 px-4 py-3.5 backdrop-blur-[2px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Ingest
            </p>
            <p className="mt-1.5 font-mono text-[13px] tabular-nums text-zinc-200">
              {isSignup ? "queued" : "synced"}
            </p>
          </div>
          <div className="bg-bv-surface/60 px-4 py-3.5 backdrop-blur-[2px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Review queue
            </p>
            <p className="mt-1.5 font-mono text-[13px] tabular-nums text-zinc-200">
              {isSignup ? "—" : "0"}
            </p>
          </div>
        </div>

        <p className="border-t border-white/[0.05] px-4 py-3 text-[11px] leading-relaxed text-zinc-600">
          Same solution model as production—structured prints, not screenshots.
        </p>
      </div>
    </div>
  );
}
