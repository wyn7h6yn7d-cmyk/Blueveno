"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2TabItem, v2TabItemActive, v2TabStrip } from "@/lib/ui/v2-surface";

export type SegmentedTabOption = {
  id: string;
  label: ReactNode;
  disabled?: boolean;
};

type SegmentedTabsProps = {
  options: SegmentedTabOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  "aria-label"?: string;
};

export function SegmentedTabs({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Sections",
}: SegmentedTabsProps) {
  return (
    <div className={cn(v2TabStrip, className)} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={opt.disabled}
            onClick={() => onChange(opt.id)}
            className={active ? v2TabItemActive : v2TabItem}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
