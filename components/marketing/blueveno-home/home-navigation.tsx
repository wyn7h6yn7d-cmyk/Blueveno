import Link from "next/link";
import { BluevenoLogoMark } from "@/components/brand/blueveno-logo-mark";
import { PremiumPrimaryLink } from "./premium-button";

const links = [
  { href: "#hero", label: "Intro" },
  { href: "#strip", label: "Essence" },
  { href: "#calendar", label: "Calendar" },
  { href: "#day", label: "Record" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function HomeNavigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[oklch(0.03_0.04_272/0.88)] font-sans backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-[3.75rem] max-w-[1320px] items-center justify-between px-4 sm:h-[4rem] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-100"
        >
          <BluevenoLogoMark className="size-6" />
          <span className="font-display text-[1.02rem] font-semibold tracking-[-0.04em] text-zinc-50">Blueveno</span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Page">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-100 transition duration-300 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center px-2 text-[13px] font-medium tracking-[-0.02em] text-zinc-100 transition hover:text-white sm:px-3"
          >
            Sign in
          </Link>
          <PremiumPrimaryLink href="/signup" compact>
            Start free
          </PremiumPrimaryLink>
        </div>
      </div>
      <nav
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/[0.05] px-3 py-2.5 lg:hidden"
        aria-label="Page sections"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-100 transition hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
