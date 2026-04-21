import Link from "next/link";
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[oklch(0.035_0.042_270/0.92)] font-sans backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[3.75rem] max-w-[1320px] items-center justify-between px-4 sm:h-[4rem] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-display text-[17px] font-semibold tracking-[-0.04em] text-zinc-50 transition hover:text-white"
        >
          Blueveno
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Page">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition duration-300 hover:text-zinc-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition hover:text-zinc-200 sm:px-3"
          >
            Sign in
          </Link>
          <PremiumPrimaryLink href="/signup" compact>
            Sign up
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
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-200"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
