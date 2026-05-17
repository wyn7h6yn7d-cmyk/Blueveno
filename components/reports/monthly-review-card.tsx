"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import type { MonthlyReviewSnapshot } from "@/lib/user-data/monthly-review";
import { MONTHLY_REVIEW_MIN_TRADED_DAYS } from "@/lib/user-data/monthly-review";
import { formatSignedPnlAmount } from "@/lib/format-pnl";

function formatDisciplineMetric(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "—";
  return `${Math.round(score)}%`;
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
  const [note, setNote] = useState("");
  const [lesson, setLesson] = useState("");
  const [focus, setFocus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { note?: string; lesson?: string; focus?: string };
      setNote(parsed.note ?? "");
      setLesson(parsed.lesson ?? "");
      setFocus(parsed.focus ?? "");
    } catch {
      // ignore invalid persisted value
    }
  }, [storageKey]);

  const persist = (next: { note: string; lesson: string; focus: string }) => {
    setNote(next.note);
    setLesson(next.lesson);
    setFocus(next.focus);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  if (!review) {
    return (
      <DashboardCard eyebrow="Monthly review" title={title} description="A month report appears after your first entry this month.">
        <p className="text-[13px] text-zinc-500">No monthly data yet for this scope.</p>
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
    `Best week: ${review.bestWeek ? `${review.bestWeek.weekStart} (${formatSignedPnlAmount(review.bestWeek.pnl, displayCurrency)})` : "—"}`,
    `Weakest week: ${review.weakestWeek ? `${review.weakestWeek.weekStart} (${formatSignedPnlAmount(review.weakestWeek.pnl, displayCurrency)})` : review.bestWeek ? "Only one active week" : "—"}`,
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
      ? `Partial ${review.monthLabel} report — ${review.tradedDays} of ${MONTHLY_REVIEW_MIN_TRADED_DAYS} traded days logged. Metrics below use available data; missing values show as —.`
      : `${review.monthLabel} summary from your journal and weekly reflections.`;

  return (
    <DashboardCard eyebrow="Monthly review" title={`${title} · ${review.monthLabel}`} description={description}>
      {!hasMonthActivity ? (
        <p className="text-[13px] text-zinc-500">
          Log entries in this month to unlock month P&amp;L, day highlights, and discipline trends.
        </p>
      ) : (
        <>
          {review.isPartial ? (
            <p className="mb-3 rounded-lg border border-[oklch(0.58_0.12_252/0.28)] bg-[oklch(0.58_0.12_252/0.1)] px-3 py-2 text-[12px] text-zinc-300">
              Early-month view: {review.tradedDays} traded day{review.tradedDays === 1 ? "" : "s"} so far
              {review.entryCount > review.tradedDays ? ` · ${review.entryCount} journal entries` : ""}. Full month
              comparisons unlock at {MONTHLY_REVIEW_MIN_TRADED_DAYS} traded days.
            </p>
          ) : null}
          <div className="grid gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
            <p>
              Month P&L: <span className="text-zinc-200">{formatSignedPnlAmount(review.monthPnl, displayCurrency)}</span>
            </p>
            <p>
              Journal entries: <span className="text-zinc-200">{review.entryCount}</span>
            </p>
            <p>
              Traded days: <span className="text-zinc-200">{review.tradedDays}</span>
            </p>
            <p>
              Trade win rate:{" "}
              <span className="text-zinc-200">
                {review.winRateTrades !== null ? `${review.winRateTrades}%` : "—"}
              </span>
            </p>
            <p>
              Best day:{" "}
              <span className="text-zinc-200">
                {review.bestDay ? `${review.bestDay.date} (${formatSignedPnlAmount(review.bestDay.pnl, displayCurrency)})` : "—"}
              </span>
            </p>
            <p>
              {review.worstOrSmallestGreenDay?.label ?? "Worst day"}:{" "}
              <span className="text-zinc-200">
                {review.worstOrSmallestGreenDay
                  ? `${review.worstOrSmallestGreenDay.date} (${formatSignedPnlAmount(review.worstOrSmallestGreenDay.pnl, displayCurrency)})`
                  : "—"}
              </span>
            </p>
            <p>
              Best week:{" "}
              <span className="text-zinc-200">
                {review.bestWeek ? `${review.bestWeek.weekStart} (${formatSignedPnlAmount(review.bestWeek.pnl, displayCurrency)})` : "—"}
              </span>
            </p>
            <p>
              Weakest week:{" "}
              <span className="text-zinc-200">
                {review.weakestWeek
                  ? `${review.weakestWeek.weekStart} (${formatSignedPnlAmount(review.weakestWeek.pnl, displayCurrency)})`
                  : review.bestWeek
                    ? "Only one active week"
                    : "—"}
              </span>
            </p>
            <p>
              Avg green day:{" "}
              <span className="text-zinc-200">
                {review.avgGreenDay === null ? "—" : formatSignedPnlAmount(review.avgGreenDay, displayCurrency)}
              </span>
            </p>
            <p>
              Avg red day:{" "}
              <span className="text-zinc-200">
                {review.avgRedDay === null ? "—" : formatSignedPnlAmount(review.avgRedDay, displayCurrency)}
              </span>
            </p>
            <p>
              Discipline score: <span className="text-zinc-200">{formatDisciplineMetric(review.disciplineScore)}</span>
            </p>
            <p>
              Best mood: <span className="text-zinc-200">{review.bestMood ?? "—"}</span>
            </p>
            <p>
              Most common mistake: <span className="text-zinc-200">{review.mostCommonMistake ?? "—"}</span>
            </p>
            <p>
              Best setup: <span className="text-zinc-200">{review.bestSetup ?? "—"}</span>
            </p>
            <p>
              Top symbol: <span className="text-zinc-200">{review.topSymbol ?? "—"}</span>
            </p>
            <p>
              Next focus: <span className="text-zinc-200">{review.nextFocus ?? "—"}</span>
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Input
              value={note}
              onChange={(e) => persist({ note: e.target.value, lesson, focus })}
              placeholder="Monthly note (optional)"
              className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
            />
            <Input
              value={lesson}
              onChange={(e) => persist({ note, lesson: e.target.value, focus })}
              placeholder="Biggest lesson (optional)"
              className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
            />
            <Input
              value={focus}
              onChange={(e) => persist({ note, lesson, focus: e.target.value })}
              placeholder="Focus for next month (optional)"
              className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={copySummary}
              className="h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200 hover:bg-white/[0.08]"
            >
              Copy summary
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportSummary}
              className="h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200 hover:bg-white/[0.08]"
            >
              Export monthly review CSV
            </Button>
            {copyMsg ? <p className="self-center text-[12px] text-zinc-400">{copyMsg}</p> : null}
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">Informational summary from logged journal data. Not financial advice.</p>
        </>
      )}
    </DashboardCard>
  );
}