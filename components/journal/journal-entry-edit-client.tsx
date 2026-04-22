"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { isValidTradingViewUrl, normalizeTradingViewUrlInput, tradingViewUrlForSave } from "@/lib/tradingview";
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
  const { updateRow, removeRow, lastError } = useUserWorkspace(userId, { initialWorkspace });

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
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!entryDate.trim() || !symbol.trim() || !pnl.trim()) return;
    if (pnl.includes(".")) {
      setSaveError("Use comma for decimals (e.g. 100,80). Dot is not allowed.");
      return;
    }
    if (!isValidTradingViewUrl(tradingViewUrl)) {
      setUrlError(
        "Use a valid TradingView chart URL (e.g. https://www.tradingview.com/chart/…), or leave the field empty.",
      );
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
      tradingViewUrl: tradingViewUrlForSave(tradingViewUrl),
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not update entry.");
      return;
    }
    router.push(`/app/journal/${entryId}`);
    router.refresh();
  };

  const onDelete = async () => {
    if (!canWriteJournal) return;
    if (!window.confirm("Delete this journal entry? This cannot be undone.")) return;
    setDeleteError(null);
    setDeleting(true);
    const result = await removeRow(entryId);
    setDeleting(false);
    if (result.ok) {
      router.push("/app/journal");
      router.refresh();
      return;
    }
    setDeleteError(result.error);
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

      {!canWriteJournal ? (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-200">
              <Lock className="size-[18px]" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/80">Read-only</p>
              <p className="mt-1 text-[14px] leading-relaxed text-zinc-200">
                Upgrade to Premium to edit entries, add a TradingView link, or change P&amp;L.
              </p>
            </div>
          </div>
          <Link
            href="/app/settings/billing"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 text-[13px] font-medium text-amber-100 transition hover:bg-amber-500/25"
          >
            View billing
          </Link>
        </div>
      ) : null}

      <DashboardCard
        eyebrow="Edit"
        title={initialRow.sym}
        description={
          canWriteJournal
            ? `Adjust P&L in ${displayCurrency} (set in Settings). TradingView link is optional.`
            : "Fields are locked until you upgrade — your saved values stay visible below."
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
                onChange={(e) => {
                  const next = e.target.value;
                  if (next.includes(".")) {
                    setSaveError("Use comma for decimals (e.g. 100,80). Dot is not allowed.");
                  } else if (saveError?.includes("comma for decimals")) {
                    setSaveError(null);
                  }
                  setPnl(next.replace(/\./g, ""));
                }}
                placeholder="+120,80 or −40"
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
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (!v) return;
                  const n = normalizeTradingViewUrlInput(v);
                  if (n !== v) setTradingViewUrl(n);
                }}
                placeholder="https://www.tradingview.com/chart/…"
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

        {canWriteJournal ? (
          <div className="mt-8 border-t border-white/[0.08] pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Danger zone</p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
              Remove this day from your journal permanently.
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || saving}
              className="mt-4 h-10 rounded-xl px-4"
              onClick={() => void onDelete()}
            >
              <Trash2 className="mr-2 size-4" strokeWidth={2} aria-hidden />
              {deleting ? "Deleting…" : "Delete entry"}
            </Button>
            {deleteError ? (
              <p className="mt-3 text-[13px] text-rose-300/95" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
        ) : null}
      </DashboardCard>
    </div>
  );
}
