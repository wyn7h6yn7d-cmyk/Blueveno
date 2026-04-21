"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, NotebookPen, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { parseR } from "@/lib/user-data/kpi";
import { EmptyState } from "@/components/app/empty-state";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";
import { JournalDayList } from "@/components/journal/journal-day-list";
import { isValidTradingViewUrl } from "@/lib/tradingview";

type Props = {
  userId: string;
  email: string;
};

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayKeyFromRow(entryDate?: string, createdAt?: string): string {
  if (entryDate) return entryDate;
  if (createdAt) return new Date(createdAt).toISOString().slice(0, 10);
  return toKey(new Date());
}

function startOfWeekMonday(base: Date) {
  const copy = new Date(base);
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

function monthKey(base: Date) {
  const m = base.getMonth() + 1;
  return `${base.getFullYear()}-${String(m).padStart(2, "0")}`;
}

function signedMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toFixed(0)}`;
}

function streakFromDaily(daily: Array<{ key: string; pnl: number }>) {
  if (daily.length === 0) return "No streak";
  const ordered = [...daily].sort((a, b) => b.key.localeCompare(a.key));
  const first = ordered[0];
  if (first.pnl === 0) return "Flat day";
  const positive = first.pnl > 0;
  let count = 0;
  for (const d of ordered) {
    if (positive && d.pnl > 0) {
      count += 1;
      continue;
    }
    if (!positive && d.pnl < 0) {
      count += 1;
      continue;
    }
    break;
  }
  return `${count} ${positive ? "green" : "red"} day${count === 1 ? "" : "s"}`;
}

export function UserDashboard({ userId, email }: Props) {
  const { data, ready, addRow, lastError } = useUserWorkspace(userId);
  const [entryDate, setEntryDate] = useState(() => toKey(new Date()));
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

  const dayAgg = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data.journal) {
      const key = dayKeyFromRow(row.entryDate, row.createdAt);
      const value = parseR(row.r) ?? 0;
      map.set(key, (map.get(key) ?? 0) + value);
    }
    return [...map.entries()].map(([key, pnlValue]) => ({ key, pnl: pnlValue }));
  }, [data.journal]);

  const summary = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeekMonday(now);
    const weekStartKey = toKey(weekStart);
    const month = monthKey(now);
    let weekPnl = 0;
    let monthPnl = 0;
    let wins = 0;
    let losses = 0;
    for (const d of dayAgg) {
      if (d.key >= weekStartKey) weekPnl += d.pnl;
      if (d.key.startsWith(month)) monthPnl += d.pnl;
      if (d.pnl > 0) wins += 1;
      if (d.pnl < 0) losses += 1;
    }
    return {
      weekPnl,
      monthPnl,
      winLoss: `${wins}/${losses}`,
      streak: streakFromDaily(dayAgg),
    };
  }, [dayAgg]);

  const recentRows = sortedRows.slice(0, 5);

  const onQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
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
      tag: "Overview",
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
        title="Overview"
        description="P&amp;L snapshot, calendar, and a fast path to log a day without leaving this screen."
        actions={
          <Link
            href="/app/journal"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-100 hover:bg-white/[0.07]",
            )}
          >
            Open journal
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Top summary row">
        {[
          { label: "This week P&L", value: signedMoney(summary.weekPnl), tone: summary.weekPnl },
          { label: "This month P&L", value: signedMoney(summary.monthPnl), tone: summary.monthPnl },
          { label: "Win / Loss days", value: summary.winLoss, tone: 0 },
          { label: "Current streak", value: summary.streak, tone: 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(155deg,oklch(0.14_0.028_262/0.96),oklch(0.112_0.026_264/0.95))] p-6 shadow-bv-card ring-1 ring-white/[0.03]"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{card.label}</p>
            <p
              className={cn(
                "font-display mt-3 text-[1.65rem] tabular-nums leading-none tracking-[-0.02em]",
                card.tone > 0 && "text-emerald-200",
                card.tone < 0 && "text-rose-200",
                card.tone === 0 && "text-zinc-50",
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <DashboardCard
          eyebrow="Calendar"
          title="Monthly P&amp;L"
          description="Day colors, weekly totals, links to saved days."
          className="xl:col-span-1"
        >
          {!ready ? (
            <div className="h-36 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
          ) : data.journal.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No trading days yet"
              description="Log a day in the journal—the calendar fills in automatically."
              className="border-none bg-transparent py-6 ring-0"
            />
          ) : (
            <PnlCalendar entries={data.journal} />
          )}
        </DashboardCard>

        <DashboardCard
          eyebrow="Quick add"
          title="Log a day"
          description="Same fields as the journal. Optional chart link must be a valid TradingView URL if provided."
        >
          <form onSubmit={onQuickAdd} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ov-date" className={labelCls}>
                  Date
                </Label>
                <Input
                  id="ov-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ov-symbol" className={labelCls}>
                  Symbol
                </Label>
                <Input
                  id="ov-symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="NQ"
                  required
                  className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ov-pnl" className={labelCls}>
                Day P&amp;L
              </Label>
              <Input
                id="ov-pnl"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="+240"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 font-mono text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ov-note" className={labelCls}>
                Note
              </Label>
              <textarea
                id="ov-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Short review of the day"
                className="w-full rounded-xl border border-white/10 bg-bv-surface-inset/80 px-3 py-2 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ov-tv" className={labelCls}>
                Chart link{" "}
                <span className="font-normal text-zinc-600">(optional)</span>
              </Label>
              <Input
                id="ov-tv"
                type="url"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="https://www.tradingview.com/chart/..."
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-[oklch(0.72_0.14_250)] text-[15px] text-[oklch(0.12_0.04_265)]"
            >
              <Plus className="mr-1.5 size-4" />
              {saving ? "Saving…" : "Save day"}
            </Button>
            {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
            {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
          </form>
        </DashboardCard>
      </section>

      <DashboardCard eyebrow="Journal" title="Latest entries" description="Newest days first—open detail or your chart.">
        {recentRows.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No journal days yet"
            description="Use Quick add above or the Journal page to create your first day."
            className="border-none bg-transparent py-6 ring-0"
          />
        ) : (
          <JournalDayList rows={recentRows} />
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
