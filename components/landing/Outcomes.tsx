import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const outcomes = [
  {
    title: "Catch failure modes early",
    body: "Behavior tied to outcome before P&L shouts.",
    metric: "Earlier",
    hint: "Repeat patterns",
    bars: [40, 55, 48, 62, 58, 70],
  },
  {
    title: "Split edge from noise",
    body: "Tags and slices—what survives conditions.",
    metric: "Sharper",
    hint: "Setup × regime",
    bars: [35, 42, 50, 45, 60, 52],
  },
  {
    title: "Make discipline visible",
    body: "Rules next to performance. Drift shows here.",
    metric: "Measured",
    hint: "Plan vs prints",
    bars: [52, 48, 55, 50, 58, 65],
  },
];

export function Outcomes() {
  return (
    <Section id="outcomes" className="relative bg-marketing-stage py-32 lg:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Outcomes</p>
          <h2 className="font-display mt-6 text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            The tape decides. Your review should too.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-snug text-zinc-500 sm:text-[15px]">
            Behavior, rules, and P&amp;L on one surface—see drift before the month does.
          </p>
        </Reveal>
      </div>

      <div className="mt-24 grid gap-6 lg:grid-cols-3 lg:gap-7">
        {outcomes.map((o, i) => (
          <Reveal key={o.title} delay={0.05 * i}>
            <div className="group flex h-full flex-col rounded-2xl border border-white/[0.09] bg-bv-surface/95 p-7 shadow-bv-card transition duration-300 hover:border-primary/35 hover:shadow-bv-float sm:p-8">
              <h3 className="font-display text-[1.125rem] font-medium leading-snug tracking-tight text-zinc-100">
                {o.title}
              </h3>
              <p className="mt-3 text-[13px] leading-snug text-zinc-500">{o.body}</p>
              <div className="mt-7 flex h-11 items-end gap-0.5 rounded-lg border border-border/50 bg-black/35 px-2 py-2">
                {o.bars.map((h, j) => (
                  <div
                    key={j}
                    className="flex-1 rounded-sm bg-gradient-to-t from-bv-blue-deep to-primary"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-9 border-t border-border/60 pt-7">
                <p className="font-display text-[2rem] tracking-tight text-zinc-50">{o.metric}</p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">{o.hint}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20 text-center">
        <a
          href={marketingCtas.outcomes.loop.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 hover:text-primary"
        >
          {marketingCtas.outcomes.loop.label} →
        </a>
      </Reveal>
    </Section>
  );
}
