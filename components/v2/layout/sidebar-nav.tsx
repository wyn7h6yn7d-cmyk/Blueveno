"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2SidebarShell } from "@/lib/ui/v2-surface";

export type SidebarNavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
  groupLabel?: string;
};

export function SidebarNav({
  items,
  footer,
  header,
  className,
  onNavigate,
  groupLabel = "Navigate",
}: SidebarNavProps) {
  return (
    <aside className={cn("flex h-full w-[17rem] shrink-0 flex-col", v2SidebarShell, className)}>
      {header ? <div className="border-b border-white/[0.08] px-4 py-4">{header}</div> : null}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Workspace navigation">
        <p className="app-kicker mb-1.5 px-2">{groupLabel}</p>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "group relative flex min-h-[2.65rem] items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
              item.active
                ? "bg-bv-blue-accent/12 text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.62_0.12_252/0.32)]"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
            )}
          >
            {item.active ? (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-[1.35rem] w-0.5 -translate-y-1/2 rounded-r-full bg-bv-cyan-electric"
              />
            ) : null}
            <item.icon
              className={cn("size-4 shrink-0", item.active ? "text-bv-ice" : "text-zinc-500 group-hover:text-zinc-300")}
              strokeWidth={1.75}
            />
            <span className="truncate">{item.label}</span>
            {item.badge ? (
              <span className="ml-auto rounded-md border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      {footer ? <div className="border-t border-white/[0.08] p-3">{footer}</div> : null}
    </aside>
  );
}
