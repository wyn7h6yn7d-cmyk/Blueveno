import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const quotes = [
  {
    quote: "Review feels like analysis—the chart stays married to the trade.",
    role: "Independent equities",
    meta: "Swing",
  },
  {
    quote: "The journal entry is the artifact. Coaching got concrete overnight.",
    role: "Head of desk",
    meta: "Remote prop",
  },
  {
    quote: "Recap export reads like risk would sign it—not a mood journal.",
    role: "Futures operator",
    meta: "Intraday",
  },
];

export function Testimonials() {
  return (
    <Section className="border-y border-border/80 bg-bv-base/50 py-28 backdrop-blur-sm lg:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Operators</p>
          <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Measured in R—not followers.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
            Early partners and desk pilots. Paraphrased for confidentiality.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.role} delay={0.05 * i}>
            <figure className="flex h-full flex-col rounded-2xl border border-border/80 bg-bv-surface/75 p-8 shadow-bv-card">
              <blockquote className="flex-1 text-[15px] leading-relaxed text-zinc-300">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-8 border-t border-white/[0.07] pt-6">
                <p className="font-display text-sm text-zinc-200">{q.role}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  {q.meta}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 text-center">
        <a
          href={marketingCtas.testimonials.join.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 transition hover:text-primary"
        >
          {marketingCtas.testimonials.join.label} →
        </a>
      </Reveal>
    </Section>
  );
}
