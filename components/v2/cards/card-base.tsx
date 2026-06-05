import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2Eyebrow, v2ModuleShell, v2ModuleTitle, v2Supporting } from "@/lib/ui/v2-surface";

export type CardBaseVariant = "default" | "inset" | "featured";

const variantClass: Record<CardBaseVariant, string> = {
  default: v2ModuleShell,
  inset: cn(
    v2ModuleShell,
    "border-white/[0.07]",
    "bg-[linear-gradient(172deg,oklch(0.125_0.024_264/0.95),oklch(0.098_0.02_266/0.94))]",
  ),
  featured: cn(
    v2ModuleShell,
    "border-bv-blue-accent/22",
    "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.07),0_24px_56px_-36px_rgba(0,0,0,0.78),0_0_40px_-38px_oklch(0.48_0.11_252/0.16)]",
  ),
};

export type CardBaseProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  variant?: CardBaseVariant;
  as?: "section" | "article" | "div";
};

export function CardBase({
  eyebrow,
  title,
  description,
  actions,
  toolbar,
  children,
  footer,
  className,
  contentClassName,
  headerClassName,
  variant = "default",
  as: Tag = "section",
}: CardBaseProps) {
  const hasHeader = eyebrow || title || description || actions;

  return (
    <Tag className={cn("flex min-w-0 flex-col overflow-hidden", variantClass[variant], className)}>
      {hasHeader ? (
        <header
          className={cn(
            "flex flex-col gap-2.5 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-3.5",
            headerClassName,
          )}
        >
          <div className="min-w-0 flex-1 space-y-1">
            {eyebrow ? <p className={v2Eyebrow}>{eyebrow}</p> : null}
            {title ? <div className={v2ModuleTitle}>{title}</div> : null}
            {description ? <p className={v2Supporting}>{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {toolbar ? <div className="border-b border-white/[0.06] px-4 py-2.5 sm:px-5">{toolbar}</div> : null}
      {children ? (
        <div className={cn("min-h-0 min-w-0 flex-1 p-4 sm:p-5", contentClassName)}>{children}</div>
      ) : null}
      {footer ? (
        <footer className="border-t border-white/[0.06] bg-black/10 px-4 py-2.5 sm:px-5 sm:py-3">{footer}</footer>
      ) : null}
    </Tag>
  );
}
