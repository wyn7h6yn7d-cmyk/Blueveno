import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const quotes = [
  {
    quote: "Chart stays with the fill—review finally feels like analysis.",
    role: "Independent equities",
    meta: "Swing",
  },
  {
    quote: "Journal entry is the artifact. Coaching went concrete overnight.",
    role: "Head of desk",
    meta: "Remote prop",
  },
  {
    quote: "Recap reads like risk would sign it.",
    role: "Futures operator",
    meta: "Intraday",
  },
];

export function Testimonials() {
  return (
    <Section className="relative border-y border-white/[0.08] bg-marketing-depth py-32 backdrop-blur-[2px] lg:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Operators</p>
          <h2 className="font-display mt-6 text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Measured in R, not followers.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-snug text-zinc-600">
            Desk pilots—paraphrased for confidentiality.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-6 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.role} delay={0.05 * i}>
            <figure className="flex h-full flex-col rounded-2xl border border-white/[0.09] bg-bv-surface/80 p-8 shadow-bv-card transition duration-300 hover:border-primary/25 hover:shadow-bv-float">
              <blockquote className="flex-1 text-[15px] leading-snug text-zinc-300">
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

      <Reveal className="mt-16 text-center">
        <a
          href={marketingCtas.testimonials.next.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 transition hover:text-primary"
        >
          {marketingCtas.testimonials.next.label} →
        </a>
      </Reveal>
    </Section>
  );
}
