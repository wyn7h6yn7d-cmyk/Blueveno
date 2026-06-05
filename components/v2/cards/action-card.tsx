import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CardBase, type CardBaseProps } from "@/components/v2/cards/card-base";
import { cn } from "@/lib/utils";
import { v2Supporting } from "@/lib/ui/v2-surface";

type ActionCardProps = Omit<CardBaseProps, "children" | "actions"> & {
  icon?: LucideIcon;
  children?: ReactNode;
  cta?: ReactNode;
  interactive?: boolean;
};

export function ActionCard({
  icon: Icon,
  children,
  cta,
  interactive = false,
  className,
  ...props
}: ActionCardProps) {
  return (
    <CardBase
      {...props}
      as="section"
      className={cn(
        interactive && "transition hover:border-white/[0.12] hover:bg-white/[0.01]",
        className,
      )}
      actions={cta}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-bv-ice">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        {children ? <div className={cn(v2Supporting, "text-[13px] leading-relaxed text-zinc-400")}>{children}</div> : null}
      </div>
    </CardBase>
  );
}
