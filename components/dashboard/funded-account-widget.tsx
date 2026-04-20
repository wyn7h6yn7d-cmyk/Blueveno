import { cn } from "@/lib/utils";
import { DashboardEyebrow, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type FundedAccountWidgetProps = {
  firm?: string;
  phase?: string;
  drawdownBuffer?: string;
  trailingDd?: string;
  daysToPayout?: string;
  status?: "ok" | "warn" | "lock";
  className?: string;
};

const statusCopy = {
  ok: { label: "Within rules", ring: "border-primary/35 text-bv-ice/90" },
  warn: { label: "Approaching limit", ring: "border-amber-400/40 text-amber-200/90" },
  lock: { label: "Lockout", ring: "border-red-400/35 text-red-200/90" },
};

export function FundedAccountWidget({
  firm = "Apex · 150K static",
  phase = "Evaluation",
  drawdownBuffer = "41%",
  trailingDd = "−2.1 / −6.0 R",
  daysToPayout = "4",
  status = "ok",
  className,
}: FundedAccountWidgetProps) {
  const s = statusCopy[status];
  return (
    <section className={cn(dashboardPanelClass, "p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <DashboardEyebrow>Funded</DashboardEyebrow>
          <p className="mt-1 font-display text-[15px] font-medium text-zinc-100">{firm}</p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{phase}</p>
        </div>
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-full border-2 bg-bv-surface-inset font-mono text-[11px] uppercase tracking-wide",
            s.ring,
          )}
        >
          {status === "ok" ? "OK" : status === "warn" ? "!" : "×"}
        </div>
      </div>

      <dl className="mt-5 space-y-4 border-t border-white/[0.06] pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-zinc-500">Drawdown buffer</dt>
          <dd className="font-display text-2xl tabular-nums text-zinc-50">{drawdownBuffer}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-zinc-500">Trailing DD</dt>
          <dd className="font-mono tabular-nums text-zinc-300">{trailingDd}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-zinc-500">Min profit days</dt>
          <dd className="font-mono tabular-nums text-zinc-400">6 / 8</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="text-zinc-500">Payout window</dt>
          <dd className="font-mono tabular-nums text-zinc-300">{daysToPayout} days</dd>
        </div>
      </dl>

      <p className="mt-4 border-t border-white/[0.06] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
        {s.label}
      </p>
    </section>
  );
}
