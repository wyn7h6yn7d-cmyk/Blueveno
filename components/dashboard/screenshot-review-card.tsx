import { cn } from "@/lib/utils";
import { dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type ScreenshotReviewCardProps = {
  label: string;
  fillId: string;
  rMultiple: string;
  caption: string;
  entryNote?: string;
  className?: string;
};

export function ScreenshotReviewCard({
  label,
  fillId,
  rMultiple,
  caption,
  entryNote = "Entry: liquidity · trigger aligned",
  className,
}: ScreenshotReviewCardProps) {
  return (
    <figure className={cn(dashboardPanelClass, "overflow-hidden", className)}>
      <div className="relative aspect-[5/4] bg-[oklch(0.08_0.03_265)]">
        <div className="absolute inset-0 bg-grid-fine opacity-25" aria-hidden />
        <div className="absolute inset-5 rounded-lg border border-white/[0.08] bg-gradient-to-br from-zinc-800/35 to-zinc-950" />
        <div className="absolute bottom-5 left-5 right-5 rounded border border-[oklch(0.55_0.15_250/0.35)] bg-black/60 px-2.5 py-1.5 font-mono text-[9px] leading-snug text-[oklch(0.88_0.06_250)] backdrop-blur-sm">
          {entryNote}
        </div>
      </div>
      <figcaption className="space-y-2 border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</span>
          <span className="font-mono text-xs font-medium tabular-nums text-zinc-100">{rMultiple}</span>
        </div>
        <p className="font-mono text-[10px] text-zinc-600">{fillId}</p>
        <p className="text-xs leading-relaxed text-zinc-500">{caption}</p>
      </figcaption>
    </figure>
  );
}
