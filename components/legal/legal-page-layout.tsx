import Link from "next/link";
import { LEGAL_LAST_UPDATED, LEGAL_NAV } from "@/lib/legal/constants";
import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  title: string;
  intro: string;
  children: React.ReactNode;
  currentPath: "/privacy" | "/terms" | "/cookies";
};

export function LegalPageLayout({ title, intro, children, currentPath }: LegalPageLayoutProps) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-20 text-zinc-100 sm:px-8 sm:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Legal</p>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-zinc-50">{title}</h1>
      <p className="mt-2 text-[13px] text-zinc-500">Last updated: {LEGAL_LAST_UPDATED}</p>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">{intro}</p>

      <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 text-[14px] leading-relaxed text-zinc-400">
        Blueveno is a journaling and review tool. It does not provide financial advice, trading signals, or investment
        recommendations. You are responsible for your own trading decisions.
      </div>

      <div className="prose-invert mt-10 space-y-10">{children}</div>

      <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.08] pt-8" aria-label="Legal pages">
        {LEGAL_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-[13px] font-medium transition",
              item.href === currentPath ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300",
            )}
            aria-current={item.href === currentPath ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="mt-8">
        <Link href="/" className="text-[13px] font-medium text-zinc-500 transition hover:text-zinc-300">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-100">{title}</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
