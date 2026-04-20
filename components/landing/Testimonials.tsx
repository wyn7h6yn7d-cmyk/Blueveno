import { Reveal } from "./Reveal";
import { Section } from "./Section";

const quotes = [
  {
    quote:
      "Blueveno is the first tool where my review feels like analysis—not therapy. The data and the chart stay married to the trade.",
    role: "Independent equities trader",
    meta: "Swing · multi-year track record",
  },
  {
    quote:
      "We stopped debating what happened in the room. The journal entry is the artifact—coaching got concrete overnight.",
    role: "Head of desk",
    meta: "Remote prop · mid-size team",
  },
  {
    quote:
      "The recap export is unfairly good. It reads like something a risk officer would sign—not a mood journal.",
    role: "Futures operator",
    meta: "Intraday · systematic discretion",
  },
];

export function Testimonials() {
  return (
    <Section className="border-y border-white/[0.05] bg-[oklch(0.09_0.025_265/0.4)] py-28 backdrop-blur-sm lg:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
            Operators
          </p>
          <h2 className="font-display mt-5 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Trusted where performance is measured in R—not followers.
          </h2>
          <p className="mt-4 text-sm text-zinc-500">
            Illustrative quotes from early design partners and pilot feedback—not paid endorsements.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-6 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.role} delay={0.06 * i}>
            <figure className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
              <blockquote className="flex-1 text-[15px] leading-relaxed text-zinc-300">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-10 border-t border-white/[0.06] pt-8">
                <p className="font-display text-sm text-zinc-200">{q.role}</p>
                <p className="mt-1.5 font-mono text-[11px] text-zinc-500">{q.meta}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
