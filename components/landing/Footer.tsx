import { LogoLink } from "@/components/landing/LogoLink";
import { Section } from "./Section";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Essentials", href: "/#core" },
      { label: "Calendar", href: "/#calendar" },
      { label: "Journal", href: "/#day" },
      { label: "Pricing", href: "/pricing" },
      { label: "Start free", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "mailto:hello@blueveno.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-bv-void py-20">
      <Section>
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <LogoLink className="inline-block font-display text-xl font-medium tracking-tight text-zinc-100 transition hover:text-white">
              Blueveno
            </LogoLink>
            <p className="mt-4 max-w-[16rem] text-sm leading-snug text-zinc-500">
              Journal, analytics, review—tied to prints. For traders who use the tape as evidence.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-12 sm:grid-cols-3 lg:max-w-2xl lg:gap-16">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">{c.title}</p>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-zinc-400 transition hover:text-zinc-100">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.06] pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] text-zinc-600">© {new Date().getFullYear()} Blueveno. All rights reserved.</p>
          <p className="font-mono text-[10px] text-zinc-600">
            Markets involve risk. Blueveno is a performance tool—not investment advice.
          </p>
        </div>
      </Section>
    </footer>
  );
}
