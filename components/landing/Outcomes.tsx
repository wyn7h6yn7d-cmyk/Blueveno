import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const outcomes = [
  {
    title: "See failure modes early",
    body: "Behavior linked to outcome—before P&L makes it loud.",
    metric: "Earlier",
    hint: "Repeat patterns",
    bars: [40, 55, 48, 62, 58, 70],
  },
  {
    title: "Split edge from noise",
    body: "Tagging and slices show what holds across conditions.",
    metric: "Sharper",
    hint: "Setup × regime",
    bars: [35, 42, 50, 45, 60, 52],
  },
  {
    title: "Make discipline visible",
    body: "Rules beside performance—drift shows in the frame.",
    metric: "Measured",
    hint: "Plan vs prints",
    bars: [52, 48, 55, 50, 58, 65],
  },
];

export function Outcomes() {
  return (
    <Section id="outcomes" className="bg-marketing-band py-28 lg:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Outcomes</p>
          <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            When the tape is the judge, intent stops mattering.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-[17px]">
            Behavior, rules, and P&amp;L on one surface—so you see drift before the month does.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-6 lg:grid-cols-3 lg:gap-7">
        {outcomes.map((o, i) => (
          <Reveal key={o.title} delay={0.05 * i}>
            <div className="group flex h-full flex-col rounded-2xl border border-border/80 bg-bv-surface/95 p-7 shadow-bv-card transition hover:border-primary/22 sm:p-8">
              <h3 className="font-display text-[1.125rem] font-medium leading-snug tracking-tight text-zinc-100">
                {o.title}
              </h3>
              <p className="mt-3.5 text-[13px] leading-relaxed text-zinc-500">{o.body}</p>
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

      <Reveal className="mt-16 text-center">
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
