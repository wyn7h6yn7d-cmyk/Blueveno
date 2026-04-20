import { cn } from "@/lib/utils";
import { DashboardEyebrow, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type SessionRecapPanelProps = {
  summary: string;
  nextSession?: string;
  /** Optional bullets */
  positives?: string[];
  negatives?: string[];
  className?: string;
};

export function SessionRecapPanel({
  summary,
  nextSession = "Enforce max adds when first target is partial.",
  positives = ["Two clean ORB sequences", "Stops respected"],
  negatives = ["One discretionary add outside playbook"],
  className,
}: SessionRecapPanelProps) {
  return (
    <section className={cn(dashboardPanelClass, "p-4 sm:p-5", className)}>
      <DashboardEyebrow>Session recap</DashboardEyebrow>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{summary}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">What worked</p>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
            {positives.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-emerald-500/80">+</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/90">Friction</p>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
            {negatives.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="text-amber-500/80">−</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Next session</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{nextSession}</p>
      </div>
    </section>
  );
}
