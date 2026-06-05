"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BarChart3, CalendarRange, Sparkles } from "lucide-react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import type { MonthlyReviewSnapshot } from "@/lib/user-data/monthly-review";
import { MONTHLY_REVIEW_MIN_TRADED_DAYS } from "@/lib/user-data/monthly-review";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { formatWeekHeadline } from "@/lib/user-data/week-labels";
import { appCardPrimary, appCardSecondary, appKicker, appMetricLabel, appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";
import { formatDisciplinePercent } from "@/lib/user-data/discipline-stats";

function formatDisciplineMetric(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return formatDisciplinePercent(null);
  }
  return formatDisciplinePercent(score);
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function pnlTone(value: number): string {
  if (value > 0) return "text-emerald-200";
  if (value < 0) return "text-rose-200";
  return "text-zinc-100";
}

type MetricProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  valueClassName?: string;
};

function Metric({ label, value, hint, valueClassName }: MetricProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5">
      <p className={appMetricLabel}>{label}</p>
      <p className={cn("mt-1.5 font-display text-[1.15rem] tabular-nums leading-snug tracking-tight", valueClassName)}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function SectionBlock({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof BarChart3;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-[oklch(0.72_0.11_252)]">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="text-[14px] font-medium text-zinc-200">{title}</h3>
          {description ? <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function loadMonthlyReviewDraft(storageKey: string): { note: string; lesson: string; focus: string } {
  if (typeof window === "undefined") return { note: "", lesson: "", focus: "" };
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return { note: "", lesson: "", focus: "" };
  try {
    const parsed = JSON.parse(raw) as { note?: string; lesson?: string; focus?: string };
    return {
      note: parsed.note ?? "",
      lesson: parsed.lesson ?? "",
      focus: parsed.focus ?? "",
    };
  } catch {
    return { note: "", lesson: "", focus: "" };
  }
}

export function MonthlyReviewCard({
  review,
  displayCurrency,
  storageKey,
  title = "Monthly review",
}: {
  review: MonthlyReviewSnapshot | null;
  displayCurrency: string;
  storageKey: string;
  title?: string;
}) {
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => loadMonthlyReviewDraft(storageKey));
  const { note, lesson, focus } = draft;

  const persist = (next: { note: string; lesson: string; focus: string }) => {
    setDraft(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  if (!review) {
    return (
      <DashboardCard eyebrow="Monthly review" title={title} description="A month report appears after your first entry this month.">
        <p className="text-[14px] text-zinc-500">No monthly data yet for this scope.</p>
      </DashboardCard>
    );
  }

  const hasMonthActivity = review.entryCount > 0 || review.tradedDays > 0;

  const summaryRows = [
    `Month: ${review.monthLabel} (${review.monthKey})`,
    `Month P&L: ${formatSignedPnlAmount(review.monthPnl, displayCurrency)}`,
    `Journal entries: ${review.entryCount}`,
    `Traded days: ${review.tradedDays}`,
    `Trade win rate: ${review.winRateTrades !== null ? `${review.winRateTrades}%` : "—"}`,
    `Best day: ${review.bestDay ? `${review.bestDay.date} (${formatSignedPnlAmount(review.bestDay.pnl, displayCurrency)})` : "—"}`,
    `${review.worstOrSmallestGreenDay?.label ?? "Worst day"}: ${review.worstOrSmallestGreenDay ? `${review.worstOrSmallestGreenDay.date} (${formatSignedPnlAmount(review.worstOrSmallestGreenDay.pnl, displayCurrency)})` : "—"}`,
    `Best week: ${review.bestWeek ? `${formatWeekHeadline(review.bestWeek.weekStart)} (${formatSignedPnlAmount(review.bestWeek.pnl, displayCurrency)})` : "—"}`,
    `Weakest week: ${review.weakestWeek ? `${formatWeekHeadline(review.weakestWeek.weekStart)} (${formatSignedPnlAmount(review.weakestWeek.pnl, displayCurrency)})` : review.bestWeek ? "Only one active week" : "—"}`,
    `Avg green day: ${review.avgGreenDay === null ? "—" : formatSignedPnlAmount(review.avgGreenDay, displayCurrency)}`,
    `Avg red day: ${review.avgRedDay === null ? "—" : formatSignedPnlAmount(review.avgRedDay, displayCurrency)}`,
    `Discipline score: ${formatDisciplineMetric(review.disciplineScore)}`,
    `Best mood: ${review.bestMood ?? "—"}`,
    `Most common mistake: ${review.mostCommonMistake ?? "—"}`,
    `Best setup: ${review.bestSetup ?? "—"}`,
    `Top symbol: ${review.topSymbol ?? "—"}`,
    `Next focus: ${review.nextFocus ?? "—"}`,
    `Monthly note: ${note || "—"}`,
    `Biggest lesson: ${lesson || "—"}`,
    `Focus for next month: ${focus || "—"}`,
  ];

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryRows.join("\n"));
      setCopyMsg("Summary copied.");
    } catch {
      setCopyMsg("Could not copy summary.");
    }
  };

  const exportSummary = () => {
    const csv = recordsToCsv(
      [
        { key: "metric", label: "metric" },
        { key: "value", label: "value" },
      ],
      summaryRows.map((line) => {
        const [metric, ...rest] = line.split(": ");
        return { metric, value: rest.join(": ") };
      }),
    );
    triggerCsvDownload(`blueveno-monthly-review-${review.monthKey}-${fileDate()}.csv`, csv);
    setCopyMsg("Monthly review CSV exported.");
  };

  const description = !hasMonthActivity
    ? `No journal entries in ${review.monthLabel} yet for this account scope.`
    : review.isPartial
      ? `Early month — ${review.tradedDays} of ${MONTHLY_REVIEW_MIN_TRADED_DAYS} traded days logged. More days improve week and mood comparisons.`
      : `How ${review.monthLabel} performed from your journal and weekly reflections.`;

  const disciplineHint =
    review.disciplineScore === null
      ? "Not enough discipline data. Log Followed plan, Respected stop, or No revenge in the journal Behavior section."
      : review.disciplineNote ?? undefined;

  const moodHint = !review.bestMood ? "Choose a mood when you log each trading day." : undefined;

  const noteFieldCls =
    "w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";

  return (
    <DashboardCard
      variant="featured"
      eyebrow="Monthly review"
      title={`${title} · ${review.monthLabel}`}
      description={description}
    >
      {!hasMonthActivity ? (
        <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-5">
          <p className="text-[14px] leading-relaxed text-zinc-400">
            Log entries in {review.monthLabel} to unlock month P&amp;L, day highlights, and behavior trends.
          </p>
          <Link href="/app/journal" className={cn(appSecondaryCta, "mt-4 inline-flex items-center gap-1.5")}>
            Go to journal
            <ArrowUpRight className="size-4 opacity-90" strokeWidth={1.75} />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {review.isPartial ? (
            <p className="rounded-xl border border-[oklch(0.58_0.12_252/0.28)] bg-[oklch(0.58_0.12_252/0.1)] px-4 py-3 text-[13px] leading-relaxed text-zinc-300">
              <span className="font-medium text-zinc-100">Partial month.</span> {review.tradedDays} traded day
              {review.tradedDays === 1 ? "" : "s"} and {review.entryCount} journal{" "}
              {review.entryCount === 1 ? "entry" : "entries"} so far. Full week comparisons unlock at{" "}
              {MONTHLY_REVIEW_MIN_TRADED_DAYS} traded days.
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cn(appCardPrimary, "px-5 py-5 sm:col-span-2 lg:col-span-1")}>
              <p className={appMetricLabel}>Month P&amp;L</p>
              <p className={cn("font-display mt-2 text-[2rem] tabular-nums leading-none tracking-[-0.03em]", pnlTone(review.monthPnl))}>
                {formatSignedPnlAmount(review.monthPnl, displayCurrency)}
              </p>
            </div>
            <div className={cn(appCardSecondary, "px-4 py-4")}>
              <p className={appMetricLabel}>Traded days</p>
              <p className="font-display mt-2 text-2xl tabular-nums text-zinc-50">{review.tradedDays}</p>
              <p className={cn(appKicker, "mt-1")}>{review.entryCount} journal entries</p>
            </div>
            <div className={cn(appCardSecondary, "px-4 py-4")}>
              <p className={appMetricLabel}>Trade win rate</p>
              <p className="font-display mt-2 text-2xl tabular-nums text-zinc-50">
                {review.winRateTrades !== null ? `${review.winRateTrades}%` : "—"}
              </p>
              <p className={cn(appKicker, "mt-1")}>Winning vs losing trades</p>
            </div>
            <div className={cn(appCardSecondary, "px-4 py-4")}>
              <p className={appMetricLabel}>Discipline</p>
              <p className="font-display mt-2 text-2xl tabular-nums text-zinc-50">
                {formatDisciplineMetric(review.disciplineScore)}
              </p>
              {disciplineHint ? (
                <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">{disciplineHint}</p>
              ) : (
                <p className={cn(appKicker, "mt-1")}>From behavior toggles</p>
              )}
            </div>
          </div>

          <SectionBlock icon={CalendarRange} title="Days & weeks" description="Best and weakest stretches this month.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Metric
                label="Best day"
                value={
                  review.bestDay ? (
                    <>
                      {formatShortDate(review.bestDay.date)}
                      <span className={cn("ml-2 text-[15px]", pnlTone(review.bestDay.pnl))}>
                        {formatSignedPnlAmount(review.bestDay.pnl, displayCurrency)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )
                }
                hint={!review.bestDay ? "Needs at least one green or red day." : undefined}
              />
              <Metric
                label={review.worstOrSmallestGreenDay?.label ?? "Worst day"}
                value={
                  review.worstOrSmallestGreenDay ? (
                    <>
                      {formatShortDate(review.worstOrSmallestGreenDay.date)}
                      <span className={cn("ml-2 text-[15px]", pnlTone(review.worstOrSmallestGreenDay.pnl))}>
                        {formatSignedPnlAmount(review.worstOrSmallestGreenDay.pnl, displayCurrency)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )
                }
              />
              <Metric
                label="Avg green / red day"
                value={
                  <span className="text-[15px] font-medium">
                    <span className={review.avgGreenDay !== null ? pnlTone(review.avgGreenDay) : "text-zinc-500"}>
                      {review.avgGreenDay === null ? "—" : formatSignedPnlAmount(review.avgGreenDay, displayCurrency)}
                    </span>
                    <span className="mx-1.5 text-zinc-600">/</span>
                    <span className={review.avgRedDay !== null ? pnlTone(review.avgRedDay) : "text-zinc-500"}>
                      {review.avgRedDay === null ? "—" : formatSignedPnlAmount(review.avgRedDay, displayCurrency)}
                    </span>
                  </span>
                }
                valueClassName="text-base"
              />
              <Metric
                label="Best week"
                value={
                  review.bestWeek ? (
                    <>
                      {formatWeekHeadline(review.bestWeek.weekStart)}
                      <span className={cn("ml-2 text-[15px]", pnlTone(review.bestWeek.pnl))}>
                        {formatSignedPnlAmount(review.bestWeek.pnl, displayCurrency)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )
                }
              />
              <Metric
                label="Weakest week"
                value={
                  review.weakestWeek ? (
                    <>
                      {formatWeekHeadline(review.weakestWeek.weekStart)}
                      <span className={cn("ml-2 text-[15px]", pnlTone(review.weakestWeek.pnl))}>
                        {formatSignedPnlAmount(review.weakestWeek.pnl, displayCurrency)}
                      </span>
                    </>
                  ) : review.bestWeek ? (
                    "Only one active week"
                  ) : (
                    "—"
                  )
                }
                hint={review.bestWeek && !review.weakestWeek ? "Add another active week to compare." : undefined}
              />
              <Metric
                label="Next focus (from reflections)"
                value={review.nextFocus ?? "—"}
                valueClassName="text-base font-medium text-zinc-200"
                hint={!review.nextFocus ? "Set focus in the weekly review on Journal." : undefined}
              />
            </div>
          </SectionBlock>

          <SectionBlock
            icon={Sparkles}
            title="Behavior & patterns"
            description="What you repeated, and how you traded."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Best mood (by avg P&L)"
                value={review.bestMood ?? "—"}
                valueClassName="text-base font-medium text-zinc-200"
                hint={moodHint}
              />
              <Metric label="Most common mistake" value={review.mostCommonMistake ?? "—"} valueClassName="text-base font-medium text-zinc-200" />
              <Metric label="Best setup (by avg P&L)" value={review.bestSetup ?? "—"} valueClassName="text-base font-medium text-zinc-200" />
              <Metric label="Top symbol" value={review.topSymbol ?? "—"} valueClassName="text-base font-medium text-zinc-200" />
            </div>
          </SectionBlock>

          <SectionBlock icon={BarChart3} title="Your takeaways" description="Saved locally on this device — optional notes for the month.">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mr-note" className={appMetricLabel}>
                  Monthly note
                </Label>
                <textarea
                  id="mr-note"
                  value={note}
                  onChange={(e) => persist({ note: e.target.value, lesson, focus })}
                  rows={3}
                  placeholder="What defined this month?"
                  className={noteFieldCls}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mr-lesson" className={appMetricLabel}>
                  Biggest lesson
                </Label>
                <textarea
                  id="mr-lesson"
                  value={lesson}
                  onChange={(e) => persist({ note, lesson: e.target.value, focus })}
                  rows={3}
                  placeholder="One thing to carry forward."
                  className={noteFieldCls}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mr-focus" className={appMetricLabel}>
                  Focus for next month
                </Label>
                <textarea
                  id="mr-focus"
                  value={focus}
                  onChange={(e) => persist({ note, lesson, focus: e.target.value })}
                  rows={3}
                  placeholder="One priority for the month ahead."
                  className={noteFieldCls}
                />
              </div>
            </div>
          </SectionBlock>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={copySummary}
              className="h-9 rounded-lg border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.08]"
            >
              Copy summary
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportSummary}
              className="h-9 rounded-lg border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.08]"
            >
              Export CSV
            </Button>
            {copyMsg ? <p className="text-[13px] text-zinc-400">{copyMsg}</p> : null}
          </div>
          <p className="text-[12px] leading-relaxed text-zinc-500">
            Summary from logged journal data for the active account scope. Not financial advice.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
