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
        "flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 px-6 py-12 text-center ring-1 ring-inset ring-white/[0.04]",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-[oklch(0.68_0.11_252)] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
        <Icon className="size-[1.15rem]" strokeWidth={1.35} />
      </div>
      <h3 className="font-display mt-4 text-[15px] font-medium tracking-tight text-zinc-100">{title}</h3>
      <p className="mt-2 max-w-[26rem] text-sm leading-relaxed text-zinc-500">{description}</p>
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  );
}
