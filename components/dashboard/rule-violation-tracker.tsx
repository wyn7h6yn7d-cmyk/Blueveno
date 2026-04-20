import { cn } from "@/lib/utils";
import type { RuleRow } from "@/components/dashboard/types";
import { DashboardEyebrow, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

const defaultRules: RuleRow[] = [
  { id: "1", label: "Max daily loss", state: "ok", detail: "−0.42 / −1.00 R" },
  { id: "2", label: "News blackout", state: "ok", detail: "Clear · no macro 30m" },
  { id: "3", label: "Consistency window", state: "warn", detail: "2 days to minimum" },
  { id: "4", label: "Max position size", state: "ok", detail: "2 lots · ES" },
];

type RuleViolationTrackerProps = {
  rules?: RuleRow[];
  className?: string;
};

const stateStyles = {
  ok: "text-emerald-400/90",
  warn: "text-amber-300/95",
  breach: "text-red-300/95",
};

export function RuleViolationTracker({ rules = defaultRules, className }: RuleViolationTrackerProps) {
  return (
    <section className={cn(dashboardPanelClass, className)}>
      <header className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <DashboardEyebrow>Rules</DashboardEyebrow>
        <p className="mt-1 font-display text-[15px] font-medium text-zinc-100">Desk constraints</p>
        <p className="mt-1 text-xs text-zinc-500">Evaluated against today&apos;s session and open risk.</p>
      </header>
      <ul className="divide-y divide-white/[0.05]">
        {rules.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-4 px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <p className="text-sm text-zinc-200">{r.label}</p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-600">{r.detail}</p>
            </div>
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] uppercase tracking-[0.14em]",
                stateStyles[r.state],
              )}
            >
              {r.state}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
