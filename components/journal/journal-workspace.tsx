"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, NotebookPen, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { EmptyState } from "@/components/app/empty-state";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";
import { JournalDayList } from "@/components/journal/journal-day-list";
import { isValidTradingViewUrl } from "@/lib/tradingview";
import { useAccess } from "@/components/access/access-provider";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";

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

export function JournalWorkspace({ userId, email, initialWorkspace, highlightDate }: Props) {
  const { canWriteJournal } = useAccess();
  const { data, ready, addRow, lastError } = useUserWorkspace(userId, { initialWorkspace });
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
      setUrlError("Enter a valid TradingView URL.");
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
      tradingViewUrl: tradingViewUrl.trim() || undefined,
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

  const labelCls = "text-[13px] font-medium text-zinc-400";

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Workspace"
        title="Journal"
        description="Calendar, quick add, and your latest entries — tied to Stats and Calendar."
        actions={
          <Link
            href="/app/journal#add"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-100 hover:bg-white/[0.07]",
            )}
          >
            Jump to add
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <DashboardCard
          eyebrow="Calendar"
          title="Monthly P&amp;L"
          description="Tap a day to focus entries below."
          className="xl:col-span-1"
        >
          {!ready ? (
            <div className="h-36 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
          ) : data.journal.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No trading days yet"
              description="Log a day below—the calendar fills in automatically."
              className="border-none bg-transparent py-6 ring-0"
            />
          ) : (
            <PnlCalendar entries={data.journal} />
          )}
        </DashboardCard>

        <DashboardCard
          eyebrow="Quick add"
          title="Log a day"
          description={
            canWriteJournal
              ? "Optional chart link must be a valid TradingView URL if provided."
              : "Upgrade to Blueveno Premium to add new trading days."
          }
        >
          <form id="add" onSubmit={onQuickAdd} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jw-date" className={labelCls}>
                  Date
                </Label>
                <Input
                  id="jw-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  disabled={!canWriteJournal}
                  className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] disabled:opacity-50"
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
                  placeholder="NQ"
                  required
                  disabled={!canWriteJournal}
                  className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] disabled:opacity-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jw-pnl" className={labelCls}>
                Day P&amp;L
              </Label>
              <Input
                id="jw-pnl"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="+240"
                required
                disabled={!canWriteJournal}
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 font-mono text-[15px] disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jw-note" className={labelCls}>
                Note
              </Label>
              <textarea
                id="jw-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Short review of the day"
                disabled={!canWriteJournal}
                className="w-full rounded-xl border border-white/10 bg-bv-surface-inset/80 px-3 py-2 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jw-tv" className={labelCls}>
                Chart link <span className="font-normal text-zinc-600">(optional)</span>
              </Label>
              <Input
                id="jw-tv"
                type="url"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="https://www.tradingview.com/chart/..."
                disabled={!canWriteJournal}
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] disabled:opacity-50"
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !canWriteJournal}
              className="h-10 rounded-xl bg-[oklch(0.72_0.14_250)] text-[15px] text-[oklch(0.12_0.04_265)] disabled:opacity-40"
            >
              <Plus className="mr-1.5 size-4" />
              {saving ? "Saving…" : "Save day"}
            </Button>
            {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
            {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
          </form>
        </DashboardCard>
      </section>

      <DashboardCard
        eyebrow="Journal"
        title="Latest entries"
        description="Entries from the last 24 hours (newest first), plus any day opened from the calendar."
      >
        {sortedRows.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No journal days yet"
            description={canWriteJournal ? "Use Quick add above to create your first day." : "Upgrade to add new days — your history stays readable."}
            className="border-none bg-transparent py-6 ring-0"
          />
        ) : rowsForLatestEntries.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="Nothing in the last 24 hours"
            description="Older days are still in the calendar. Pick a date or scroll the list from Stats."
            className="border-none bg-transparent py-6 ring-0"
          />
        ) : (
          <JournalDayList rows={rowsForLatestEntries} highlightDate={highlightDate} />
        )}
      </DashboardCard>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <p className="text-[14px] leading-relaxed text-zinc-500">
          Signed in as <span className="text-zinc-200">{email}</span>
        </p>
      </section>
    </div>
  );
}
