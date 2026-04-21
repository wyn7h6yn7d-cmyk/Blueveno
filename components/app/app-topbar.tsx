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
  const sectionLabel =
    pathname.startsWith("/app/calendar")
      ? "Calendar"
      : pathname.startsWith("/app/journal")
        ? "Journal"
        : pathname.startsWith("/app/settings")
          ? "Settings"
          : "Overview";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
    setSigningOut(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.12_0.03_262/0.95),oklch(0.1_0.03_264/0.9))] px-3 backdrop-blur-xl md:h-[3.75rem] md:gap-4 md:px-5">
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
        <SheetContent side="left" className="w-[min(100%,18rem)] border-border/85 bg-bv-base p-0">
          <SheetHeader className="border-b border-border/80 px-4 py-4 text-left">
            <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
              Blueveno
            </SheetTitle>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Workspace</p>
          </SheetHeader>
          <div className="flex flex-col p-3">
            <AppSidebarNav onNavigate={() => setMobileNavOpen(false)} />
            <AppSidebarFooter onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Blueveno app</p>
        <p className="font-display mt-1 truncate text-lg tracking-tight text-zinc-50">{sectionLabel}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/app/calendar"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-3 text-zinc-200 hover:bg-white/[0.07] md:inline-flex",
          )}
        >
          <CalendarDays className="mr-1.5 size-4" />
          Calendar
        </Link>
        <Link
          href="/app/journal#add"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-3 text-zinc-200 hover:bg-white/[0.07]",
          )}
        >
          <NotebookPen className="mr-1.5 size-4" />
          Add day
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "h-10 w-10 rounded-full border border-white/[0.1] bg-white/[0.03] p-0 hover:bg-white/[0.08]",
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
            className="min-w-[220px] rounded-xl border border-white/[0.1] bg-[oklch(0.12_0.03_262)] p-1.5 text-zinc-100 shadow-bv-float"
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              <p className="truncate text-sm text-zinc-100">{displayName}</p>
              {user.email ? <p className="truncate text-xs text-zinc-500">{user.email}</p> : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem className="rounded-lg px-2 py-2 text-sm text-zinc-200" onClick={() => router.push("/app/settings")}>
              <Settings className="size-4 text-zinc-400" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-2 py-2 text-sm text-rose-200 focus:bg-rose-500/15 focus:text-rose-100"
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
