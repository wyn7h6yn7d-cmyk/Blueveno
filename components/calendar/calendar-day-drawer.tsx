"use client";

import Link from "next/link";
import { ExternalLink, LineChart, NotebookPen, Pencil, Plus } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { entryDisciplineFraction } from "@/lib/user-data/stats-display";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayKeys: string[];
  entries: JournalRow[];
  displayCurrency: string;
};

function formatDayHeading(dayKeys: string[]): string {
  if (dayKeys.length === 0) return "Trading day";
  if (dayKeys.length === 1) {
    const d = new Date(`${dayKeys[0]}T12:00:00`);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  }
  const a = new Date(`${dayKeys[0]}T12:00:00`);
  const b = new Date(`${dayKeys[dayKeys.length - 1]}T12:00:00`);
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  return `Weekend · ${fmt.format(a)} – ${fmt.format(b)}`;
}

function tagList(row: JournalRow): string[] {
  const tags: string[] = [];
  if (row.setup && row.setup !== "Other" && row.setup !== "—") tags.push(String(row.setup));
  if (row.tag && row.tag !== "None" && row.tag !== "Manual") tags.push(String(row.tag));
  if (row.sessionTag) tags.push(String(row.sessionTag));
  if (row.marketCondition) tags.push(String(row.marketCondition));
  return tags;
}

export function CalendarDayDrawer({ open, onOpenChange, dayKeys, entries, displayCurrency }: Props) {
  const dayEntries = entries
    .filter((row) => dayKeys.includes(dayKeyFromRow(row.entryDate, row.createdAt)))
    .sort((a, b) => dayKeyFromRow(b.entryDate, b.createdAt).localeCompare(dayKeyFromRow(a.entryDate, a.createdAt)));

  const dailyPnl = dayEntries.reduce((sum, row) => sum + (parsePnlAmount(row.r) ?? 0), 0);
  const primaryDayKey = dayKeys[0] ?? "";
  const addHref = primaryDayKey
    ? `/app/journal?date=${encodeURIComponent(primaryDayKey)}&tab=add`
    : "/app/journal?tab=add";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-white/[0.1] bg-[linear-gradient(168deg,oklch(0.11_0.032_262/0.98),oklch(0.07_0.028_266/0.98))] text-zinc-100 sm:max-w-md"
      >
        <SheetHeader className="space-y-1 border-b border-white/[0.08] pb-4 text-left">
          <SheetTitle className="font-display text-lg font-semibold tracking-tight text-zinc-50">
            {formatDayHeading(dayKeys)}
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed text-zinc-400">
            {dayEntries.length === 0
              ? "No entries logged for this day yet."
              : `${dayEntries.length} entr${dayEntries.length === 1 ? "y" : "ies"} · ${formatSignedPnlAmount(dailyPnl, displayCurrency)} day P&L`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 pb-6 pt-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
            <p className="app-metric-label">Daily P&L</p>
            <p
              className={cn(
                "font-display mt-1 text-2xl tabular-nums tracking-[-0.03em]",
                dailyPnl > 0 && "text-emerald-200",
                dailyPnl < 0 && "text-rose-200",
                dailyPnl === 0 && "text-zinc-100",
              )}
            >
              {dayEntries.length > 0 ? formatSignedPnlAmount(dailyPnl, displayCurrency) : "—"}
            </p>
          </div>

          {dayEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-10 text-center">
              <NotebookPen className="mx-auto size-8 text-zinc-600" strokeWidth={1.5} />
              <p className="mt-3 text-[13px] text-zinc-400">Log this day to see entries and discipline here.</p>
              <Link href={addHref} className={cn(appPrimaryCta, "mt-4 inline-flex h-10 items-center px-4 text-[13px]")}>
                <Plus className="mr-2 size-4" />
                Add entry for this date
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEntries.map((row) => {
                const pnl = parsePnlAmount(row.r);
                const tags = tagList(row);
                const note = row.note?.trim();
                const lesson = row.lessonLearned?.trim();
                return (
                  <article
                    key={row.id}
                    className="rounded-xl border border-white/[0.07] bg-[linear-gradient(160deg,oklch(0.13_0.03_262/0.88),oklch(0.09_0.026_266/0.88))] p-4 transition-colors hover:border-white/[0.12]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-zinc-100">{row.sym || "—"}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{dayKeyFromRow(row.entryDate, row.createdAt)}</p>
                      </div>
                      <p
                        className={cn(
                          "font-display text-lg tabular-nums",
                          pnl !== null && pnl > 0 && "text-emerald-200",
                          pnl !== null && pnl < 0 && "text-rose-200",
                          (pnl === null || pnl === 0) && "text-zinc-300",
                        )}
                      >
                        {pnl !== null ? formatSignedPnlAmount(pnl, displayCurrency) : "—"}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      {row.moodState ? (
                        <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-zinc-300">
                          {row.moodState}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-[oklch(0.58_0.12_252/0.35)] bg-[oklch(0.58_0.12_252/0.12)] px-2 py-0.5 text-zinc-200">
                        Discipline {entryDisciplineFraction(row)}
                      </span>
                      {tags.map((tag) => (
                        <span
                          key={`${row.id}-${tag}`}
                          className="rounded-full border border-white/[0.1] bg-black/25 px-2 py-0.5 text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {note ? (
                      <p className="mt-3 text-[12px] leading-relaxed text-zinc-400 line-clamp-3">{note}</p>
                    ) : null}
                    {lesson ? (
                      <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
                        <span className="text-zinc-600">Lesson · </span>
                        {lesson}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/app/journal/${row.id}`}
                        className={cn(appSecondaryCta, "inline-flex h-8 items-center px-3 text-[12px]")}
                      >
                        Open entry
                      </Link>
                      <Link
                        href={`/app/journal/${row.id}/edit`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-[12px] text-zinc-300 hover:bg-white/[0.06]"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      {row.chartLinkUrl ? (
                        <>
                          <a
                            href={row.chartLinkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[oklch(0.58_0.12_252/0.35)] bg-[oklch(0.58_0.12_252/0.1)] px-3 text-[12px] text-zinc-200 hover:bg-[oklch(0.58_0.12_252/0.16)]"
                          >
                            <LineChart className="size-3.5" />
                            View chart
                            <ExternalLink className="size-3 opacity-60" />
                          </a>
                        </>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {dayEntries.length > 0 ? (
            <Link href={addHref} className={cn(appPrimaryCta, "inline-flex h-11 w-full items-center justify-center text-[14px]")}>
              <Plus className="mr-2 size-4" />
              Add entry for this date
            </Link>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
