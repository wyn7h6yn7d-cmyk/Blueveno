import Link from "next/link";
import { PremiumPrimaryLink } from "./premium-button";

const links = [
  { href: "#hero", label: "Surface" },
  { href: "#strip", label: "Essence" },
  { href: "#calendar", label: "Calendar" },
  { href: "#day", label: "Record" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function HomeNavigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.038_0.04_270/0.88)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-[3.85rem] max-w-7xl items-center justify-between px-4 sm:h-[4rem] sm:px-8">
        <Link
          href="/"
          className="font-display text-[15px] font-semibold tracking-[-0.035em] text-zinc-50 transition hover:text-white"
        >
          Blueveno
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Page">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12.5px] font-medium tracking-[-0.01em] text-zinc-500 transition duration-300 hover:text-zinc-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center px-1 text-[12.5px] font-medium tracking-[-0.01em] text-zinc-500 transition hover:text-zinc-200"
          >
            Sign in
          </Link>
          <PremiumPrimaryLink href="/signup" compact>
            Begin
          </PremiumPrimaryLink>
        </div>
      </div>
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/[0.04] px-3 py-2.5 lg:hidden"
        aria-label="Page sections"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-300"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
