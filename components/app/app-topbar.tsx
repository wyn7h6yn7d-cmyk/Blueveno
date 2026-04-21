"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  LogOut,
  Menu,
  NotebookPen,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";

type AppTopbarProps = {
  user: { name?: string | null; email?: string | null };
};

export function AppTopbar({ user }: AppTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user.name?.trim() || user.email?.trim() || "Account";
  const fallbackInitial = displayName.charAt(0).toUpperCase() || "A";
  const sectionLabel = pathname.startsWith("/app/calendar")
    ? "Calendar"
    : pathname.startsWith("/app/journal")
      ? "Journal"
      : pathname.startsWith("/app/settings/billing")
        ? "Billing"
        : pathname.startsWith("/app/settings")
          ? "Settings"
          : pathname.startsWith("/app/analytics")
            ? "Analytics"
            : pathname.startsWith("/app/reviews")
              ? "Reviews"
              : pathname.startsWith("/app/playbooks")
                ? "Playbooks"
                : "Overview";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSigningOut(false);
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-[3.25rem] shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[linear-gradient(180deg,oklch(0.125_0.028_262/0.97),oklch(0.102_0.028_264/0.94))] px-3 shadow-[0_1px_0_0_oklch(1_0_0_/0.04)] backdrop-blur-xl md:h-16 md:gap-4 md:px-5">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "shrink-0 text-zinc-300 md:hidden",
          )}
          aria-label="Open navigation"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100%,18rem)] border-white/[0.08] bg-bv-base p-0">
          <SheetHeader className="border-b border-white/[0.06] px-5 py-5 text-left">
            <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
              Blueveno
            </SheetTitle>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Workspace</p>
          </SheetHeader>
          <div className="flex flex-col gap-1 p-3">
            <AppSidebarNav onNavigate={() => setMobileNavOpen(false)} />
            <AppSidebarFooter onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:block">Workspace</p>
        <p className="font-display truncate text-[1.125rem] font-medium tracking-tight text-zinc-50 sm:mt-0.5 sm:text-lg">
          {sectionLabel}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/app/calendar"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-3.5 text-[13px] text-zinc-200 hover:bg-white/[0.07] md:inline-flex",
          )}
        >
          <CalendarDays className="mr-1.5 size-4 opacity-90" />
          Calendar
        </Link>
        <Link
          href="/app/journal#add"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-3.5 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
          )}
        >
          <NotebookPen className="mr-1.5 size-4 opacity-90" />
          New entry
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "h-10 w-10 rounded-full border border-white/[0.1] bg-white/[0.04] p-0 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]",
            )}
            aria-label="Open account menu"
          >
            <Avatar size="sm" className="size-8">
              <AvatarFallback className="bg-[oklch(0.22_0.06_255)] text-xs font-semibold text-zinc-100">
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="min-w-[13.75rem] rounded-xl border border-white/[0.09] bg-[oklch(0.125_0.028_262)] p-1.5 text-zinc-100 shadow-bv-float ring-1 ring-white/[0.04]"
          >
            <DropdownMenuLabel className="px-2.5 py-2">
              <p className="truncate text-[13px] font-medium text-zinc-100">{displayName}</p>
              {user.email ? <p className="truncate text-xs text-zinc-500">{user.email}</p> : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]"
              onClick={() => router.push("/app/settings")}
            >
              <Settings className="size-4 text-zinc-400" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-rose-200/95 outline-none focus-visible:bg-rose-500/12 focus-visible:text-rose-50"
              onClick={handleSignOut}
            >
              <LogOut className="size-4 text-rose-300" />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
