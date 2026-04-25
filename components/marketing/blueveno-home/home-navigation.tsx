import Link from "next/link";
import { BluevenoLogoMark } from "@/components/brand/blueveno-logo-mark";

export function HomeNavigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent font-sans">
      <div className="mx-auto flex h-[3.75rem] max-w-[1320px] items-center justify-between px-4 sm:h-[4rem] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-100"
        >
          <BluevenoLogoMark className="size-6" />
          <span className="font-display text-[1.02rem] font-semibold tracking-[-0.04em] text-zinc-50">Blueveno</span>
        </Link>
        <div />
      </div>
    </header>
  );
}
