import { cn } from "@/lib/utils";
import { DashboardEyebrow, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";
import { Button } from "@/components/ui/button";

export type PlaybookCondition = { met: boolean; text: string };

type PlaybookCardProps = {
  name: string;
  adherence: string;
  conditions: PlaybookCondition[];
  enforce: string;
  onEdit?: () => void;
  className?: string;
};

export function PlaybookCard({
  name,
  adherence,
  conditions,
  enforce,
  onEdit,
  className,
}: PlaybookCardProps) {
  return (
    <section className={cn(dashboardPanelClass, "flex flex-col", className)}>
      <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div>
          <DashboardEyebrow>Playbook</DashboardEyebrow>
          <h3 className="font-display mt-1 text-[15px] font-medium text-zinc-100">{name}</h3>
          <p className="mt-1 font-mono text-[11px] text-zinc-500">Adherence · {adherence}</p>
        </div>
        {onEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-white/[0.1] bg-transparent text-xs"
            onClick={onEdit}
          >
            Edit
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-white/[0.1] bg-transparent text-xs"
            disabled
          >
            Edit
          </Button>
        )}
      </header>
      <div className="space-y-4 p-4 sm:p-5">
        <ul className="space-y-2">
          {conditions.map((c, i) => (
            <li
              key={i}
              className="flex gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300"
            >
              <span
                className={cn(
                  "mt-0.5 font-mono text-xs",
                  c.met ? "text-emerald-400/90" : "text-zinc-600",
                )}
                aria-hidden
              >
                {c.met ? "✓" : "○"}
              </span>
              {c.text}
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-dashed border-white/[0.1] bg-bv-surface-inset/70 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-zinc-500">
          {enforce}
        </div>
      </div>
    </section>
  );
}
