import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";
import { dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type EmotionalNoteCardProps = {
  /** Short mood / state label */
  label?: string;
  /** Body — trader reflection */
  note: string;
  /** Session timestamp */
  session?: string;
  className?: string;
};

export function EmotionalNoteCard({
  label = "Post-close",
  note,
  session = "2024-04-18 · NY morning",
  className,
}: EmotionalNoteCardProps) {
  return (
    <aside className={cn(dashboardPanelClass, "relative p-4 sm:p-5", className)}>
      <div className="pointer-events-none absolute right-4 top-4 opacity-[0.07]" aria-hidden>
        <Quote className="size-16 text-primary/80" strokeWidth={1} />
      </div>
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
        <p className="mt-1 font-mono text-[11px] text-zinc-600">{session}</p>
        <blockquote className="mt-4 border-l-2 border-primary/45 pl-4 text-sm leading-relaxed text-zinc-300">
          {note}
        </blockquote>
        <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
          Emotional tags inform review—they do not replace the tape.
        </p>
      </div>
    </aside>
  );
}
