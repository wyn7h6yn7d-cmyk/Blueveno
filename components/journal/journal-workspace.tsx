"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, LineChart, NotebookPen, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { EmptyState } from "@/components/app/empty-state";
import { JournalDayList } from "@/components/journal/journal-day-list";
import { isValidTradingViewUrl, tradingViewUrlForSave } from "@/lib/tradingview";
import { useAccess } from "@/components/access/access-provider";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";

const ROW_24H_MS = 24 * 60 * 60 * 1000;

function rowEventTimeMs(row: JournalRow): number {
  if (row.createdAt) {
    const t = Date.parse(row.createdAt);
    if (!Number.isNaN(t)) return t;
  }
  if (row.entryDate) {
    const t = Date.parse(`${row.entryDate}T12:00:00`);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
  highlightDate?: string;
};

const labelCls = "text-[12px] font-medium tracking-wide text-zinc-400";
const inputCls =
  "h-11 rounded-xl border-white/[0.1] bg-black/25 text-[15px] shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] placeholder:text-zinc-600 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";

export function JournalWorkspace({ userId, email, initialWorkspace, highlightDate }: Props) {
  const { canWriteJournal, displayCurrency } = useAccess();
  const { data, ready, addRow, lastError, removeRow } = useUserWorkspace(userId, { initialWorkspace });
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symbol, setSymbol] = useState("");
  const [pnl, setPnl] = useState("");
  const [note, setNote] = useState("");
  const [tradingViewUrl, setTradingViewUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedRows = useMemo(() => {
    return [...data.journal].sort((a, b) => {
      const ak = dayKeyFromRow(a.entryDate, a.createdAt);
      const bk = dayKeyFromRow(b.entryDate, b.createdAt);
      return bk.localeCompare(ak);
    });
  }, [data.journal]);

  const latestEntriesLast24h = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- rolling 24h window for latest entries
    const cutoff = Date.now() - ROW_24H_MS;
    return sortedRows.filter((row) => rowEventTimeMs(row) >= cutoff);
  }, [sortedRows]);

  const rowsForLatestEntries = useMemo(() => {
    const byId = new Map<string, JournalRow>();
    for (const r of latestEntriesLast24h) byId.set(r.id, r);
    if (highlightDate) {
      for (const r of sortedRows) {
        if (dayKeyFromRow(r.entryDate, r.createdAt) === highlightDate) {
          byId.set(r.id, r);
        }
      }
    }
    return [...byId.values()].sort((a, b) => {
      const ak = dayKeyFromRow(a.entryDate, a.createdAt);
      const bk = dayKeyFromRow(b.entryDate, b.createdAt);
      return bk.localeCompare(ak);
    });
  }, [sortedRows, latestEntriesLast24h, highlightDate]);

  useEffect(() => {
    if (!highlightDate || !ready || rowsForLatestEntries.length === 0) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector(`[data-journal-date="${highlightDate}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [highlightDate, ready, rowsForLatestEntries.length]);

  const onQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!entryDate.trim() || !symbol.trim() || !pnl.trim()) return;
    if (!isValidTradingViewUrl(tradingViewUrl)) {
      setUrlError(
        "Use a valid TradingView chart URL (e.g. https://www.tradingview.com/chart/…), or leave the field empty.",
      );
      return;
    }
    setUrlError(null);
    setSaveError(null);
    setSaving(true);
    const result = await addRow({
      entryDate,
      time: "Day close",
      sym: symbol.trim().toUpperCase(),
      setup: "Day",
      r: pnl.trim(),
      tag: "Journal",
      note: note.trim() || undefined,
      tradingViewUrl: tradingViewUrlForSave(tradingViewUrl),
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not save day entry.");
      return;
    }
    setSymbol("");
    setPnl("");
    setNote("");
    setTradingViewUrl("");
  };

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Journal"
        title="Daily review"
        description="Quick log below — your calendar shows the same P&amp;L when you open it."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Calendar
            </Link>
            <a href="#add" className={appPrimaryCta}>
              <Plus className="mr-2 size-4" strokeWidth={2} />
              New entry
            </a>
          </div>
        }
      />

      <section className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
        <DashboardCard
          eyebrow="Log day"
          title="Quick entry"
          className="min-h-0 min-w-0"
          description={
            canWriteJournal
              ? "P&amp;L uses your display currency from Settings. TradingView is optional — paste when you want the chart next to the number. The calendar page picks up the same entries."
              : "Read-only: your history stays here. Upgrade to log new days."
          }
        >
          <form id="add" onSubmit={onQuickAdd} className="space-y-7">
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Session</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jw-date" className={labelCls}>
                    Session date
                  </Label>
                  <Input
                    id="jw-date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-symbol" className={labelCls}>
                    Symbol
                  </Label>
                  <Input
                    id="jw-symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. NQ"
                    required
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jw-pnl" className={labelCls}>
                  Day P&L ({displayCurrency})
                </Label>
                <Input
                  id="jw-pnl"
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                  placeholder="+120 or −40"
                  required
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "font-mono disabled:opacity-45")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Note</p>
              <textarea
                id="jw-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What stood out — setup, execution, one line on mood."
                disabled={!canWriteJournal}
                className={cn(
                  "w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600",
                  "shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] disabled:opacity-45",
                )}
              />
            </div>

            <div className="rounded-xl border border-[oklch(0.52_0.12_252/0.2)] bg-[linear-gradient(168deg,oklch(0.1_0.04_264/0.5),oklch(0.06_0.03_268/0.45))] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[oklch(0.74_0.11_252)]">
                  <LineChart className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Label htmlFor="jw-tv" className={cn(labelCls, "text-zinc-200")}>
                    TradingView link
                    <span className="ml-2 font-normal text-zinc-600">Optional</span>
                  </Label>
                  <Input
                    id="jw-tv"
                    type="url"
                    value={tradingViewUrl}
                    onChange={(e) => setTradingViewUrl(e.target.value)}
                    placeholder="https://www.tradingview.com/chart/…"
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving || !canWriteJournal}
              className={cn(
                "h-12 w-full rounded-xl text-[15px] font-semibold tracking-tight",
                "bg-[linear-gradient(180deg,oklch(0.74_0.14_250),oklch(0.66_0.15_252))] text-[oklch(0.1_0.04_265)]",
                "shadow-[0_1px_0_0_oklch(1_0_0_/0.14)_inset,0_14px_44px_-14px_oklch(0.42_0.14_252/0.55)] hover:brightness-[1.04] disabled:opacity-40",
              )}
            >
              <Plus className="mr-2 size-4" strokeWidth={2} />
              {saving ? "Saving…" : "Save day"}
            </Button>
            {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
            {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
          </form>
        </DashboardCard>

        <DashboardCard
          eyebrow="Recent"
          title="Latest activity"
          className="min-h-0 min-w-0 lg:sticky lg:top-6"
          description="Newest from the last day — plus any day you opened via a calendar link (?date=)."
        >
          {sortedRows.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No entries yet"
              description={
                canWriteJournal
                  ? "Use Quick entry beside this panel to save your first day."
                  : "Your history remains below once you have entries — upgrade to add more."
              }
              className="border-none bg-transparent py-8 ring-0"
            />
          ) : rowsForLatestEntries.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="Nothing new in the last 24 hours"
              description="Open Calendar for the month grid, or Stats for the full picture."
              className="border-none bg-transparent py-8 ring-0"
            />
          ) : (
            <JournalDayList
              rows={rowsForLatestEntries}
              highlightDate={highlightDate}
              displayCurrency={displayCurrency}
              canWriteJournal={canWriteJournal}
              onDeleteRow={canWriteJournal ? removeRow : undefined}
            />
          )}
        </DashboardCard>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <p className="text-[14px] text-zinc-500">
          Signed in as <span className="text-zinc-200">{email}</span>
        </p>
      </section>
    </div>
  );
}
