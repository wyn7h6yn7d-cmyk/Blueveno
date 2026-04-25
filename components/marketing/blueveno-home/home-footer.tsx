import Link from "next/link";
import { OpenCookieSettingsButton } from "@/components/legal/open-cookie-settings-button";

export function HomeFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <p className="font-display text-[15px] font-medium tracking-[-0.03em] text-zinc-500">Blueveno</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          <Link href="/pricing" className="transition hover:text-zinc-400">
            Pricing
          </Link>
          <Link href="/privacy" className="transition hover:text-zinc-400">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-400">
            Terms
          </Link>
          <Link href="/cookies" className="transition hover:text-zinc-400">
            Cookies
          </Link>
          <OpenCookieSettingsButton className="transition hover:text-zinc-400">
            Manage cookies
          </OpenCookieSettingsButton>
          <a href="mailto:hello@blueveno.com" className="transition hover:text-zinc-400">
            Contact
          </a>
          <span className="text-zinc-700">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
