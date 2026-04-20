import { Section } from "./Section";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Outcomes", href: "#outcomes" },
      { label: "Platform", href: "#platform" },
      { label: "Workflow", href: "#workflow" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Traders", href: "#traders" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "mailto:hello@blueveno.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050507] py-16">
      <Section>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-zinc-100">
              Blueveno
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Premium trading performance analytics and journaling—built for operators who
              care about the long game.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-10 sm:grid-cols-3 lg:max-w-2xl">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  {c.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-zinc-400 transition hover:text-zinc-100"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-zinc-600">
            © {new Date().getFullYear()} Blueveno. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-zinc-600">
            Markets involve risk. Blueveno is a performance tool—not investment advice.
          </p>
        </div>
      </Section>
    </footer>
  );
}
