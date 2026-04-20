"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  Command,
  ExternalLink,
  FileText,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";

type AppTopbarProps = {
  user: { name?: string | null; email?: string | null };
};

export function AppTopbar({ user }: AppTopbarProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-bv-raised/82 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-bv-raised/72 md:h-[3.75rem] md:gap-4 md:px-5">
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

      <div className="relative min-w-0 flex-1 md:max-w-md lg:max-w-lg">
        <label htmlFor="workspace-search" className="sr-only">
          Search workspace
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
          strokeWidth={1.75}
          aria-hidden
        />
        <Input
          id="workspace-search"
          type="search"
          placeholder="Search trades, tags, sessions…"
          className="h-10 w-full rounded-xl border-white/[0.08] bg-bv-surface-inset/90 pl-10 pr-14 text-sm text-zinc-100 placeholder:text-zinc-600"
          autoComplete="off"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 lg:inline-flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden gap-2 text-zinc-400 sm:inline-flex",
            )}
          >
            <Sparkles className="size-4" strokeWidth={1.75} />
            <span className="hidden lg:inline">Quick actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem disabled className="gap-2">
              <BookOpen className="size-4 opacity-70" />
              New journal entry
              <span className="ml-auto font-mono text-[10px] text-zinc-600">Soon</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="gap-2">
              <FileText className="size-4 opacity-70" />
              Session recap
              <span className="ml-auto font-mono text-[10px] text-zinc-600">Soon</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="gap-2">
              <Command className="size-4 opacity-70" />
              Command palette
              <span className="ml-auto font-mono text-[10px] text-zinc-600">Soon</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative text-zinc-400 hover:text-zinc-100"
          aria-label="Notifications"
          title="Notifications (placeholder)"
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-bv-cyan-electric ring-2 ring-bv-raised" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "size-9 rounded-full border-white/[0.1] bg-white/[0.03] p-0 hover:bg-white/[0.06]",
            )}
            aria-label="Account menu"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/25 text-xs font-medium text-bv-ice">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-100">{user.name ?? "Trader"}</span>
                <span className="text-xs font-normal text-zinc-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/app/settings")} className="gap-2">
              <User className="size-4" />
              Profile & workspace
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/app/settings/billing")} className="gap-2">
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/")} className="gap-2">
              <ExternalLink className="size-4" />
              Marketing site
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
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
  );
}
