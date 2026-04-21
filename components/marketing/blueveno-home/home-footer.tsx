import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="border-t border-white/[0.05] py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-8">
        <p className="font-display text-sm text-zinc-400">Blueveno</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-zinc-500">
          <Link href="/pricing" className="transition hover:text-zinc-300">
            Pricing
          </Link>
          <Link href="/privacy" className="transition hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-300">
            Terms
          </Link>
          <a href="mailto:hello@blueveno.com" className="transition hover:text-zinc-300">
            Contact
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
