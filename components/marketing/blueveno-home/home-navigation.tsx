import Link from "next/link";
import { BluevenoLogoMark } from "@/components/brand/blueveno-logo-mark";
import { PremiumPrimaryLink } from "./premium-button";

const NAV_LINKS = [
  { href: "#hero", label: "Intro" },
  { href: "#essence", label: "Essence" },
  { href: "#calendar", label: "Calendar" },
  { href: "#journal", label: "Record" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function HomeNavigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-[4rem] max-w-[1320px] items-center justify-between px-5 sm:h-[4.35rem] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-100"
        >
          <BluevenoLogoMark className="size-6" />
          <span className="font-display text-[1.02rem] font-semibold tracking-[-0.04em] text-zinc-50">Blueveno</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium tracking-[-0.012em] text-zinc-300 transition hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/login"
            className="inline-flex min-h-[2.45rem] items-center px-2.5 text-[13px] font-medium tracking-[-0.02em] text-zinc-100 transition hover:text-white sm:px-3"
          >
            Sign in
          </Link>
          <PremiumPrimaryLink href="/signup" compact>
            Start free
          </PremiumPrimaryLink>
        </div>
      </div>
    </header>
  );
}
