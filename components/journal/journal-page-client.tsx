"use client";

import { useMemo, useState } from "react";
import { CalendarDays, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EmptyState } from "@/components/app/empty-state";
import { isValidTradingViewUrl } from "@/lib/tradingview";
import { JournalDayList } from "@/components/journal/journal-day-list";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function JournalPageClient({ userId, initialWorkspace }: Props) {
  const { data, ready, addRow, lastError } = useUserWorkspace(userId, { initialWorkspace });

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symbol, setSymbol] = useState("");
  const [pnl, setPnl] = useState("");
  const [notes, setNotes] = useState("");
  const [tradingViewUrl, setTradingViewUrl] = useState("");
  const [tags, setTags] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => {
    return [...data.journal].sort((a, b) => {
      const ad = a.entryDate ?? a.createdAt ?? "";
      const bd = b.entryDate ?? b.createdAt ?? "";
      return bd.localeCompare(ad);
    });
  }, [data.journal]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !pnl.trim() || !entryDate.trim()) return;
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
      tag: tags.trim() || "",
      note: notes.trim() || undefined,
      tradingViewUrl: tradingViewUrl.trim() || undefined,
    });
    setSaving(false);

    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not save entry. Check your settings and database migration.");
      return;
    }

    setSymbol("");
    setPnl("");
    setNotes("");
    setTradingViewUrl("");
    setTags("");
  };

  const lb = "text-[13px] font-medium text-zinc-400";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Journal"
        title="Daily journal"
        description="One row per day: market, P&amp;L, notes, and an optional TradingView link."
      />

      <DashboardCard
        eyebrow="New entry"
        title="Add a trading day"
        description="Chart link is optional; if set, it must be a tradingview.com URL."
        variant="inset"
      >
        {!ready ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-10 max-w-md animate-pulse rounded-xl bg-white/[0.04]" />
            <div className="h-24 animate-pulse rounded-xl bg-white/[0.03]" />
          </div>
        ) : (
          <form id="add" onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jr-date" className={lb}>
                Date
              </Label>
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
              <Label htmlFor="jr-symbol" className={lb}>
                Symbol
              </Label>
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
              <Label htmlFor="jr-pnl" className={lb}>
                Day P&amp;L
              </Label>
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
              <Label htmlFor="jr-notes" className={lb}>
                Notes
              </Label>
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
              <Label htmlFor="jr-tv" className={lb}>
                Chart link <span className="font-normal text-zinc-600">(optional)</span>
              </Label>
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
              <Label htmlFor="jr-tags" className={lb}>
                Tags <span className="font-normal text-zinc-600">(optional)</span>
              </Label>
              <Input
                id="jr-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="discipline, opening-drive"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Button
                type="submit"
                disabled={saving}
                className="h-10 min-h-10 rounded-xl bg-[oklch(0.72_0.14_250)] px-6 text-[15px] text-[oklch(0.12_0.04_265)]"
              >
                {saving ? "Saving…" : "Save day"}
              </Button>
            </div>

            {urlError ? <p className="sm:col-span-2 lg:col-span-3 text-[13px] text-rose-300/95">{urlError}</p> : null}
            {saveError ? <p className="sm:col-span-2 lg:col-span-3 text-[13px] text-rose-300/95">{saveError}</p> : null}
            {saveError?.toLowerCase().includes("database is not initialized") ? (
              <p className="sm:col-span-2 lg:col-span-3 text-xs text-zinc-400">
                Apply migration `supabase/migrations/20260421_create_journal_entries.sql` (and then reload the app).
              </p>
            ) : null}
          </form>
        )}
      </DashboardCard>

      {sorted.length === 0 ? (
        <DashboardCard eyebrow="Journal" title="No entries yet" description="Your list appears here after the first save.">
          <EmptyState
            icon={CalendarDays}
            title="No trading days yet"
            description="Add a day above—your chart link and P&amp;L stay on the record."
            action={
              <a
                href="#add"
                className="inline-flex h-10 min-h-10 items-center rounded-xl border border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.06]"
              >
                <NotebookPen className="mr-2 size-4 opacity-90" />
                Add first day
              </a>
            }
          />
        </DashboardCard>
      ) : (
        <DashboardCard eyebrow="Journal" title="Recent trading days" description="Newest first.">
          <JournalDayList rows={sorted} />
        </DashboardCard>
      )}
    </div>
  );
}
