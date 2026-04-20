import { Reveal } from "./Reveal";
import { Section } from "./Section";

const quotes = [
  {
    quote:
      "Blueveno is the first journal that feels like a performance lab. I don’t ‘write up’ my day—I interrogate it with data attached.",
    role: "Independent futures trader",
    meta: "8+ years · intraday",
  },
  {
    quote:
      "Screenshots tied to fills changed how we coach. Feedback stops being opinion and becomes a shared artifact.",
    role: "Desk lead · remote prop team",
    meta: "12 traders · hybrid",
  },
  {
    quote:
      "The recap exports are unfairly good. It’s like having a risk officer who only cares about your process.",
    role: "Swing trader · equities",
    meta: "Multi-day holds",
  },
];

export function Testimonials() {
  return (
    <Section className="border-y border-white/[0.06] bg-[#06070b]/50 py-24 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
            Operators, not influencers
          </p>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Trusted by traders who measure in R—not likes.
          </h2>
          <p className="mt-4 text-sm text-zinc-500">
            Quotes reflect design feedback from early pilot users and are illustrative.
          </p>
        </Reveal>
      </div>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.role} delay={0.06 * i}>
            <figure className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <blockquote className="flex-1 text-sm leading-relaxed text-zinc-300">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-white/[0.06] pt-6">
                <p className="font-display text-sm text-zinc-200">{q.role}</p>
                <p className="mt-1 font-mono text-[11px] text-zinc-500">{q.meta}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
