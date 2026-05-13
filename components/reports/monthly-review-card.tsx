"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import type { MonthlyReviewSnapshot } from "@/lib/user-data/monthly-review";
import { formatSignedPnlAmount } from "@/lib/format-pnl";

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

  if (!review || review.tradedDays === 0) {
    return (
      <DashboardCard eyebrow="Monthly review" title={title} description="A month report appears after your first traded day this month.">
        <p className="text-[13px] text-zinc-500">No monthly data yet for this scope.</p>
      </DashboardCard>
    );
  }

  const summaryRows = [
    `Month: ${review.monthKey}`,
    `Month P&L: ${formatSignedPnlAmount(review.monthPnl, displayCurrency)}`,
    `Traded days: ${review.tradedDays}`,
    `Trade win rate: ${review.winRateTrades ?? "—"}%`,
    `Best day: ${review.bestDay ? `${review.bestDay.date} (${formatSignedPnlAmount(review.bestDay.pnl, displayCurrency)})` : "—"}`,
    `${review.worstOrSmallestGreenDay?.label ?? "Worst day"}: ${review.worstOrSmallestGreenDay ? `${review.worstOrSmallestGreenDay.date} (${formatSignedPnlAmount(review.worstOrSmallestGreenDay.pnl, displayCurrency)})` : "—"}`,
    `Best week: ${review.bestWeek ? `${review.bestWeek.weekStart} (${formatSignedPnlAmount(review.bestWeek.pnl, displayCurrency)})` : "—"}`,
    `Weakest week: ${review.weakestWeek ? `${review.weakestWeek.weekStart} (${formatSignedPnlAmount(review.weakestWeek.pnl, displayCurrency)})` : "—"}`,
    `Avg green day: ${review.avgGreenDay === null ? "—" : formatSignedPnlAmount(review.avgGreenDay, displayCurrency)}`,
    `Avg red day: ${review.avgRedDay === null ? "—" : formatSignedPnlAmount(review.avgRedDay, displayCurrency)}`,
    `Discipline score: ${review.disciplineScore ?? "—"}%`,
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

  return (
    <DashboardCard eyebrow="Monthly review" title={title} description="Data-only monthly summary from your journal and weekly reflections.">
      <div className="grid gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-3 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
        <p>Month P&L: <span className="text-zinc-200">{formatSignedPnlAmount(review.monthPnl, displayCurrency)}</span></p>
        <p>Traded days: <span className="text-zinc-200">{review.tradedDays}</span></p>
        <p>Trade win rate: <span className="text-zinc-200">{review.winRateTrades ?? "—"}%</span></p>
        <p>Best day: <span className="text-zinc-200">{review.bestDay ? `${review.bestDay.date} (${formatSignedPnlAmount(review.bestDay.pnl, displayCurrency)})` : "—"}</span></p>
        <p>{review.worstOrSmallestGreenDay?.label ?? "Worst day"}: <span className="text-zinc-200">{review.worstOrSmallestGreenDay ? `${review.worstOrSmallestGreenDay.date} (${formatSignedPnlAmount(review.worstOrSmallestGreenDay.pnl, displayCurrency)})` : "—"}</span></p>
        <p>Best week: <span className="text-zinc-200">{review.bestWeek ? `${review.bestWeek.weekStart} (${formatSignedPnlAmount(review.bestWeek.pnl, displayCurrency)})` : "—"}</span></p>
        <p>Weakest week: <span className="text-zinc-200">{review.weakestWeek ? `${review.weakestWeek.weekStart} (${formatSignedPnlAmount(review.weakestWeek.pnl, displayCurrency)})` : "—"}</span></p>
        <p>Avg green day: <span className="text-zinc-200">{review.avgGreenDay === null ? "—" : formatSignedPnlAmount(review.avgGreenDay, displayCurrency)}</span></p>
        <p>Avg red day: <span className="text-zinc-200">{review.avgRedDay === null ? "—" : formatSignedPnlAmount(review.avgRedDay, displayCurrency)}</span></p>
        <p>Discipline score: <span className="text-zinc-200">{review.disciplineScore ?? "—"}%</span></p>
        <p>Best mood: <span className="text-zinc-200">{review.bestMood ?? "—"}</span></p>
        <p>Most common mistake: <span className="text-zinc-200">{review.mostCommonMistake ?? "—"}</span></p>
        <p>Best setup: <span className="text-zinc-200">{review.bestSetup ?? "—"}</span></p>
        <p>Top symbol: <span className="text-zinc-200">{review.topSymbol ?? "—"}</span></p>
        <p>Next focus: <span className="text-zinc-200">{review.nextFocus ?? "—"}</span></p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Input value={note} onChange={(e) => persist({ note: e.target.value, lesson, focus })} placeholder="Monthly note (optional)" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
        <Input value={lesson} onChange={(e) => persist({ note, lesson: e.target.value, focus })} placeholder="Biggest lesson (optional)" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
        <Input value={focus} onChange={(e) => persist({ note, lesson, focus: e.target.value })} placeholder="Focus for next month (optional)" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={copySummary} className="h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200 hover:bg-white/[0.08]">
          Copy summary
        </Button>
        <Button type="button" variant="outline" onClick={exportSummary} className="h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200 hover:bg-white/[0.08]">
          Export monthly review CSV
        </Button>
        {copyMsg ? <p className="self-center text-[12px] text-zinc-400">{copyMsg}</p> : null}
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">Informational summary from logged journal data. Not financial advice.</p>
    </DashboardCard>
  );
}
