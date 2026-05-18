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
  default: "w-fit max-w-full py-2",
  compact: "w-fit max-w-full py-2",
  sticky: cn(
    "sticky z-20 top-[var(--app-topbar-offset,3.75rem)]",
    "w-fit max-w-full border-none bg-transparent py-2 shadow-none",
  ),
};

const variantTrack: Record<SizeKey, string> = {
  default: "gap-1 rounded-2xl p-1",
  compact: "gap-1 rounded-xl p-1",
  sticky: "gap-1 rounded-2xl p-1",
};

const variantTab: Record<SizeKey, string> = {
  default: "min-h-9 gap-2 rounded-xl px-3.5 py-2 text-[13px] leading-none",
  compact: "min-h-9 gap-1.5 rounded-lg px-3.5 py-2 text-[13px] leading-none",
  sticky: "min-h-10 gap-2 rounded-xl px-3.5 py-2 text-[13px] leading-none",
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
        "w-fit max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex w-fit shrink-0 items-center border border-white/[0.08] bg-white/[0.03]",
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
                "inline-flex shrink-0 items-center font-medium whitespace-nowrap transition-[color,background,box-shadow,border-color]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                variantTab[size],
                isActive
                  ? "border border-blue-400/30 bg-blue-500/15 text-zinc-50 shadow-[0_0_24px_rgba(59,130,246,0.20)]"
                  : "border border-transparent text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200",
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

  return <div className={variantShell[size]}>{track}</div>;
}

/** Aliases — same component. */
export const GlassTabs = SectionNav;
export const SectionSwitch = SectionNav;

/** @deprecated Use SectionNav */
export const AppSectionNav = SectionNav;

/** @deprecated Use SectionNavItem */
export type AppSectionNavItem = SectionNavItem;
