"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  BookOpen,
  Brain,
  CreditCard,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/playbooks", label: "Playbooks", icon: Activity },
  { href: "/dashboard/behavior", label: "Behavior", icon: Brain },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type DashboardShellProps = {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user.email?.slice(0, 2).toUpperCase() ||
    "BV";

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="sticky top-0 z-30 flex w-full shrink-0 flex-col border-b border-border/80 bg-sidebar/95 backdrop-blur-xl md:h-screen md:w-56 md:border-r md:border-b-0">
        <div className="flex h-14 items-center border-b border-border/80 px-4 md:h-16">
          <Link href="/dashboard" className="font-display text-lg font-medium tracking-tight">
            Blueveno
          </Link>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col md:gap-0.5 md:p-3">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
              >
                <item.icon className="size-4 opacity-80" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-border/80 p-3 md:block">
          <Link
            href="/dashboard/settings/billing"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
          >
            <CreditCard className="size-4" />
            Billing
          </Link>
        </div>
      </aside>
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border/80 bg-background/80 px-4 backdrop-blur-xl md:h-16 md:px-6">
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden md:inline-flex",
              )}
            >
              Marketing site
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-sm" }),
                  "size-9 rounded-full p-0",
                )}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium">{user.name ?? "Trader"}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings/billing")}>
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-2"
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,oklch(0.35_0.12_250_/_0.12),transparent)]">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
