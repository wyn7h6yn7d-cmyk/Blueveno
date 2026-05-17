"use client";

import { useCallback, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionNavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
};

export type SectionNavVariant = "compact" | "sticky";

type SectionNavProps = {
  items: SectionNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  variant?: SectionNavVariant;
  className?: string;
};

type SizeKey = SectionNavVariant | "default";

const variantShell: Record<SizeKey, string> = {
  default: "",
  compact: "",
  sticky: cn(
    "sticky z-20 pb-2 pt-0.5 top-[4.75rem]",
    "bg-[oklch(0.07_0.03_266/0.55)] backdrop-blur-md",
  ),
};

const variantTrack: Record<SizeKey, string> = {
  default: "gap-0.5 rounded-2xl p-1",
  compact: "gap-0.5 rounded-xl p-0.5",
  sticky: "gap-0.5 rounded-2xl p-1",
};

const variantTab: Record<SizeKey, string> = {
  default: "h-9 gap-2 rounded-xl px-3.5 text-[13px]",
  compact: "h-8 gap-1.5 rounded-lg px-3 text-[12px]",
  sticky: "h-9 gap-2 rounded-xl px-3.5 text-[13px]",
};

const variantIcon: Record<SizeKey, string> = {
  default: "size-3.5",
  compact: "size-3",
  sticky: "size-3.5",
};

/**
 * Premium dark glass segmented control for in-app section switching.
 * Use `variant="sticky"` for scroll-spy pages (e.g. Stats); `compact` for dense headers.
 */
export function SectionNav({
  items,
  activeId,
  onChange,
  ariaLabel,
  variant,
  className,
}: SectionNavProps) {
  const size: SizeKey = variant === "compact" ? "compact" : variant === "sticky" ? "sticky" : "default";
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const focusTab = useCallback((id: string) => {
    tabRefs.current.get(id)?.focus();
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (items.length === 0) return;
      const currentIndex = items.findIndex((item) => item.id === activeId);
      const startIndex = currentIndex >= 0 ? currentIndex : 0;

      let nextIndex = startIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        nextIndex = (startIndex + 1) % items.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        nextIndex = (startIndex - 1 + items.length) % items.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        nextIndex = items.length - 1;
      } else {
        return;
      }

      const next = items[nextIndex];
      if (!next) return;
      onChange(next.id);
      focusTab(next.id);
    },
    [activeId, focusTab, items, onChange],
  );

  const track = (
    <div
      className={cn(
        "max-w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex min-w-0 items-center border border-white/[0.08] bg-white/[0.03]",
          "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]",
          variantTrack[size],
        )}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`section-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={item.id}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center font-medium whitespace-nowrap transition-[color,background,box-shadow]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]",
                variantTab[size],
                isActive
                  ? "bg-[oklch(0.58_0.12_252/0.16)] text-zinc-50 shadow-[0_0_0_1px_oklch(0.58_0.12_252/0.32),0_10px_28px_-14px_oklch(0.48_0.14_252/0.55)]"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
              )}
            >
              {Icon ? (
                <Icon className={cn("shrink-0 opacity-90", variantIcon[size])} strokeWidth={1.75} aria-hidden />
              ) : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (variant === "sticky") {
    return <div className={variantShell.sticky}>{track}</div>;
  }

  return track;
}

/** Aliases — same component. */
export const GlassTabs = SectionNav;
export const SectionSwitch = SectionNav;

/** @deprecated Use SectionNav */
export const AppSectionNav = SectionNav;

/** @deprecated Use SectionNavItem */
export type AppSectionNavItem = SectionNavItem;
