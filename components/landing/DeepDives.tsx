import { Reveal } from "./Reveal";
import { Section } from "./Section";
import {
  JournalStripMock,
  PlaybookMock,
  PropRulesMock,
  ScreenshotReviewMock,
  SessionRecapMock,
} from "@/components/mockups/ProductMockups";

const blocks = [
  {
    eyebrow: "Evidence, not memory",
    title: "Journal stream that writes itself—then holds you accountable",
    body: "Blueveno ingests executions and stitches the narrative: time, context, tags, and your notes—so the journal is complete even on your worst days.",
    mock: <JournalStripMock />,
  },
  {
    eyebrow: "See the trade, not the fantasy",
    title: "Screenshot review that stays tied to the fill",
    body: "Attach the moment on chart to the moment in the account. When you revisit losers, you’re not guessing what you saw—you’re looking at what you did.",
    mock: <ScreenshotReviewMock />,
  },
  {
    eyebrow: "Playbooks that survive adrenaline",
    title: "Turn discretion into repeatable rules",
    body: "Write the conditions, the triggers, and the hard stops where you can read them—then measure adherence like any other KPI.",
    mock: <PlaybookMock />,
  },
  {
    eyebrow: "Firm rules, front and center",
    title: "Prop awareness without switching tools",
    body: "Model buffers, consistency windows, and blackout periods alongside performance—so risk isn’t a spreadsheet you open once a week.",
    mock: <PropRulesMock />,
  },
  {
    eyebrow: "Close the loop",
    title: "Session recaps you can ship to a coach—or your future self",
    body: "Structured summaries distill what mattered, what broke, and what you’ll enforce next session—exportable, searchable, and calm.",
    mock: <SessionRecapMock />,
  },
];

export function DeepDives() {
  return (
    <Section className="py-24 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
            Deep product story
          </p>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Built for the long arc of mastery—not a weekend streak.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Each layer connects: capture, context, analytics, and discipline—so improvement
            compounds instead of resetting every Monday.
          </p>
        </Reveal>
      </div>
      <div className="mt-20 space-y-24 lg:space-y-32">
        {blocks.map((b, i) => (
          <div
            key={b.title}
            className={`flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16 ${
              i % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/70">
                {b.eyebrow}
              </p>
              <h3 className="font-display mt-4 text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
                {b.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-zinc-400">{b.body}</p>
              <div className="mt-8 h-px w-full max-w-sm bg-gradient-to-r from-teal-500/25 via-white/10 to-transparent" />
              <a
                href="#cta"
                className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-teal-200"
              >
                Get early access
                <span aria-hidden>→</span>
              </a>
            </Reveal>
            <Reveal delay={0.08}>{b.mock}</Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
