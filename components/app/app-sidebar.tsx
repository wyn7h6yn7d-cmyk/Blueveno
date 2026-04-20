"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LineChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/journal", label: "Journal", icon: BookOpen },
  { href: "/app/analytics", label: "Analytics", icon: LineChart },
  { href: "/app/playbooks", label: "Playbooks", icon: Activity },
  { href: "/app/reviews", label: "Reviews", icon: ClipboardList },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

type AppSidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebarNav({ onNavigate, className }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Workspace">
      {APP_NAV.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-[oklch(0.45_0.1_250/0.15)] text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.55_0.14_250/0.25)]"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-opacity",
                active ? "text-[oklch(0.78_0.12_250)]" : "text-zinc-500 group-hover:text-zinc-300",
              )}
              strokeWidth={1.75}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/app/settings/billing");

  return (
    <div className="border-t border-white/[0.06] p-3">
      <Link
        href="/app/settings/billing"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          active
            ? "bg-white/[0.04] text-zinc-50"
            : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
        )}
      >
        <CreditCard className="size-4 shrink-0 text-zinc-500" strokeWidth={1.75} />
        <span>Billing</span>
      </Link>
    </div>
  );
}
