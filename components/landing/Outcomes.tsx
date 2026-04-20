import { Reveal } from "./Reveal";
import { Section } from "./Section";

const outcomes = [
  {
    title: "Stop repeating expensive mistakes",
    body: "Behavior tracking shows which impulses show up before drawdowns—so you intervene on process, not feelings.",
    stat: "−38%",
    statLabel: "typical reduction in “same mistake” repeats",
  },
  {
    title: "Know what actually pays you",
    body: "Tagging and analytics separate luck from edge—by strategy, session, and market regime.",
    stat: "4.2×",
    statLabel: "faster review vs. manual spreadsheets",
  },
  {
    title: "Protect the downside you ignore",
    body: "Prop-aware surfaces keep rules visible while you trade—before a violation becomes a headline.",
    stat: "24/7",
    statLabel: "account guardrail awareness",
  },
];

export function Outcomes() {
  return (
    <Section id="outcomes" className="py-24 lg:py-32">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
          Outcomes first
        </p>
        <h2 className="font-display mt-4 max-w-2xl text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
          Performance isn’t a vibe. It’s a set of decisions you can audit.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          Blueveno is built for traders who want the truth in one place: what you did, why
          it happened, and what to change next—without drowning in spreadsheets.
        </p>
      </Reveal>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {outcomes.map((o, i) => (
          <Reveal key={o.title} delay={0.06 * i}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090e] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-teal-500/20">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/5 blur-3xl transition group-hover:bg-teal-500/10" />
              <p className="font-display text-lg text-zinc-100">{o.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{o.body}</p>
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <p className="font-display text-4xl tracking-tight text-zinc-100">{o.stat}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  {o.statLabel}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-12 text-center">
        <a
          href="#cta"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-teal-300/90 hover:text-teal-200"
        >
          See how teams use Blueveno
          <span aria-hidden>→</span>
        </a>
      </Reveal>
    </Section>
  );
}
