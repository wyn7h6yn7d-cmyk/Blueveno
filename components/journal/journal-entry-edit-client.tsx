"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { isValidTradingViewUrl } from "@/lib/tradingview";
import { useAccess } from "@/components/access/access-provider";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";

const labelCls = "text-[12px] font-medium tracking-wide text-zinc-400";
const inputCls =
  "h-11 rounded-xl border-white/[0.1] bg-black/25 text-[15px] shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] placeholder:text-zinc-600 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";

type Props = {
  userId: string;
  entryId: string;
  initialWorkspace: UserWorkspaceSnapshot;
  initialRow: JournalRow;
};

export function JournalEntryEditClient({ userId, entryId, initialWorkspace, initialRow }: Props) {
  const router = useRouter();
  const { canWriteJournal, displayCurrency } = useAccess();
  const { updateRow, lastError } = useUserWorkspace(userId, { initialWorkspace });

  const preserved = useRef({ setup: initialRow.setup, tag: initialRow.tag, time: initialRow.time });

  const [entryDate, setEntryDate] = useState(
    () => initialRow.entryDate ?? new Date(initialRow.createdAt ?? Date.now()).toISOString().slice(0, 10),
  );
  const [symbol, setSymbol] = useState(initialRow.sym);
  const [pnl, setPnl] = useState(initialRow.r);
  const [note, setNote] = useState(initialRow.note ?? "");
  const [tradingViewUrl, setTradingViewUrl] = useState(initialRow.tradingViewUrl ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!entryDate.trim() || !symbol.trim() || !pnl.trim()) return;
    if (!isValidTradingViewUrl(tradingViewUrl)) {
      setUrlError("Use a valid TradingView chart URL, or leave the field empty.");
      return;
    }
    setUrlError(null);
    setSaveError(null);
    setSaving(true);
    const result = await updateRow(entryId, {
      entryDate,
      time: preserved.current.time,
      sym: symbol.trim().toUpperCase(),
      setup: preserved.current.setup,
      r: pnl.trim(),
      tag: preserved.current.tag,
      note: note.trim() || undefined,
      tradingViewUrl: tradingViewUrl.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not update entry.");
      return;
    }
    router.push(`/app/journal/${entryId}`);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Journal"
        title="Edit entry"
        description="Update the day’s fields — calendar and stats refresh from the same data."
        actions={
          <Link href={`/app/journal/${entryId}`} className={appSecondaryCta}>
            <ArrowLeft className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Back to detail
          </Link>
        }
      />

      <DashboardCard
        eyebrow="Edit"
        title={initialRow.sym}
        description={
          canWriteJournal
            ? `Adjust P&L in ${displayCurrency} (set in Settings). TradingView link is optional.`
            : "Your trial has ended in write mode. Upgrade to edit entries — saved data stays readable."
        }
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Trade</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="je-date" className={labelCls}>
                  Session date
                </Label>
                <Input
                  id="je-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "disabled:opacity-45")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="je-symbol" className={labelCls}>
                  Symbol
                </Label>
                <Input
                  id="je-symbol"
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
              <Label htmlFor="je-pnl" className={labelCls}>
                Day P&L ({displayCurrency})
              </Label>
              <Input
                id="je-pnl"
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
              id="je-note"
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

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="space-y-2">
              <Label htmlFor="je-tv" className={cn(labelCls, "text-zinc-300")}>
                TradingView chart
                <span className="ml-2 font-normal text-zinc-600">Optional</span>
              </Label>
              <Input
                id="je-tv"
                type="url"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="Paste a chart URL"
                disabled={!canWriteJournal}
                className={cn(inputCls, "disabled:opacity-45")}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving || !canWriteJournal}
            className={cn(
              "h-12 w-full rounded-xl text-[15px] font-medium tracking-tight",
              "bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.68_0.15_252))] text-[oklch(0.12_0.04_265)]",
              "shadow-[0_1px_0_0_oklch(1_0_0_/0.12)_inset,0_12px_40px_-12px_oklch(0.45_0.14_252/0.5)] hover:brightness-[1.03] disabled:opacity-40",
            )}
          >
            <Check className="mr-2 size-4" strokeWidth={2} />
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
          {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
        </form>
      </DashboardCard>
    </div>
  );
}
