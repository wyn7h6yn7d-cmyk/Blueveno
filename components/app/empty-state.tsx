import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-bv-surface-inset/40 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[oklch(0.62_0.12_250)]">
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <h3 className="font-display mt-5 text-base font-medium text-zinc-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
