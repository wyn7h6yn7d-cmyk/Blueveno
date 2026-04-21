"use client";

import { useMemo, useState } from "react";
import { CalendarDays, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { EmptyState } from "@/components/app/empty-state";
import { isValidTradingViewUrl } from "@/lib/tradingview";
import { JournalDayList } from "@/components/journal/journal-day-list";

type Props = {
  userId: string;
};

export function JournalPageClient({ userId }: Props) {
  const { data, ready, addRow } = useUserWorkspace(userId);

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symbol, setSymbol] = useState("");
  const [pnl, setPnl] = useState("");
  const [notes, setNotes] = useState("");
  const [tradingViewUrl, setTradingViewUrl] = useState("");
  const [tags, setTags] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...data.journal].sort((a, b) => {
      const ad = a.entryDate ?? a.createdAt ?? "";
      const bd = b.entryDate ?? b.createdAt ?? "";
      return bd.localeCompare(ad);
    });
  }, [data.journal]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !pnl.trim() || !entryDate.trim()) return;
    if (!isValidTradingViewUrl(tradingViewUrl)) {
      setUrlError("Enter a valid TradingView URL.");
      return;
    }
    setUrlError(null);

    addRow({
      entryDate,
      time: "Day close",
      sym: symbol.trim().toUpperCase(),
      setup: "Day",
      r: pnl.trim(),
      tag: tags.trim() || "",
      note: notes.trim() || undefined,
      tradingViewUrl: tradingViewUrl.trim() || undefined,
    });

    setSymbol("");
    setPnl("");
    setNotes("");
    setTradingViewUrl("");
    setTags("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Journal"
        title="Daily journal"
        description="Log date, market, day P&L, notes, and chart link. Nothing extra."
      />

      <DashboardCard
        eyebrow="New trading day"
        title="Add day entry"
        description="Simple MVP workflow."
        variant="inset"
      >
        {!ready ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <form id="add" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jr-date">Date</Label>
              <Input
                id="jr-date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jr-symbol">Symbol / Market</Label>
              <Input
                id="jr-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ES"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jr-pnl">Day P&L</Label>
              <Input
                id="jr-pnl"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="+180"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 font-mono text-[15px]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="jr-notes">Short notes</Label>
              <textarea
                id="jr-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What went well? What to improve tomorrow?"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-bv-surface-inset/80 px-3 py-2 text-[15px] text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="jr-tv">TradingView chart link</Label>
              <Input
                id="jr-tv"
                type="url"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="https://www.tradingview.com/chart/..."
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jr-tags">Tags (optional)</Label>
              <Input
                id="jr-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="discipline, opening-drive"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" className="h-10 rounded-xl bg-[oklch(0.72_0.14_250)] text-[15px] text-[oklch(0.12_0.04_265)]">
                Save day entry
              </Button>
            </div>

            {urlError ? <p className="sm:col-span-2 lg:col-span-3 text-sm text-rose-300">{urlError}</p> : null}
          </form>
        )}
      </DashboardCard>

      {sorted.length === 0 ? (
        <DashboardCard eyebrow="Journal" title="No entries yet" description="Clean start for every new user.">
          <EmptyState
            icon={CalendarDays}
            title="No trading days yet"
            description="Add your first journal day, paste a TradingView link, and start tracking your week."
            action={
              <a href="#add" className="inline-flex h-9 items-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-zinc-200 hover:bg-white/[0.06]">
                <NotebookPen className="mr-2 size-4" />
                Add first day
              </a>
            }
          />
        </DashboardCard>
      ) : (
        <DashboardCard
          eyebrow="Entries"
          title="Recent trading days"
          description="Minimal list for quick scanning and day detail access."
        >
          <JournalDayList rows={sorted} />
        </DashboardCard>
      )}
    </div>
  );
}
