"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccess } from "@/components/access/access-provider";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import type { JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";

type Props = {
  row: JournalRowDb;
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function JournalDetailView({ row, userId, initialWorkspace }: Props) {
  const router = useRouter();
  const { displayCurrency, canWriteJournal } = useAccess();
  const { removeRow } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts, activeAccountId } = useTradingAccountsWorkspace();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const chartUrl = row.chart_link_url as string | null;
  const rawPnl = String(row.r_value ?? "");
  const pnlNum = parsePnlAmount(rawPnl);
  const pnlTitle = pnlNum !== null ? formatSignedPnlAmount(pnlNum, displayCurrency) : rawPnl;
  const accountName = accounts.find((a) => a.id === activeAccountId)?.name ?? "Active account";
  const entryDay = row.entry_date ?? (row.created_at ? row.created_at.slice(0, 10) : "");

  const orderedRows = useMemo(() => {
    return [...initialWorkspace.journal].sort((a, b) => {
      const ad = a.entryDate ?? a.createdAt ?? "";
      const bd = b.entryDate ?? b.createdAt ?? "";
      return ad.localeCompare(bd);
    });
  }, [initialWorkspace.journal]);

  const currentIdx = useMemo(() => orderedRows.findIndex((r) => r.id === row.id), [orderedRows, row.id]);
  const prevEntry = currentIdx > 0 ? orderedRows[currentIdx - 1] : null;
  const nextEntry = currentIdx >= 0 && currentIdx < orderedRows.length - 1 ? orderedRows[currentIdx + 1] : null;
  const sameDayEntries = orderedRows.filter((r) => (r.entryDate ?? "") === entryDay && r.id !== row.id).slice(0, 6);

  const onDelete = async () => {
    if (!canWriteJournal) return;
    setDeleteError(null);
    setDeleting(true);
    const result = await removeRow(row.id);
    setDeleting(false);
    if (result.ok) {
      setConfirmOpen(false);
      router.push("/app/journal");
      router.refresh();
      return;
    }
    setDeleteError(result.error);
  };

  async function copyChartLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Day review"
        title={`${row.symbol} · ${entryDay || row.entry_time}`}
        description="Review the completed day: result, discipline, context, and lesson."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canWriteJournal ? (
              <Link
                href={`/app/journal/${row.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-[oklch(0.58_0.12_252/0.35)] bg-[oklch(0.55_0.12_252/0.12)] px-4 text-zinc-100 hover:bg-[oklch(0.55_0.12_252/0.2)]",
                )}
              >
                <Pencil className="mr-2 size-4" strokeWidth={2} aria-hidden />
                Edit
              </Link>
            ) : (
              <Link
                href="/app/settings/billing"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                View plan
              </Link>
            )}
            {canWriteJournal ? (
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                className="h-9 rounded-xl px-4"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-2 size-4" strokeWidth={2} aria-hidden />
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            ) : null}
            <Link
              href="/app/journal"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              Back
            </Link>
          </div>
        }
      />

      {deleteError ? (
        <p className="text-[13px] text-rose-300/95" role="alert">
          {deleteError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardCard
          eyebrow="Result"
          title={pnlTitle}
          description={`${entryDay || "No date"} · ${row.symbol} · ${accountName}`}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Setup tag</p>
              <p className="mt-1.5 text-[13px] text-zinc-100">{row.setup || "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Mistake tag</p>
              <p className="mt-1.5 text-[13px] text-zinc-100">{row.tag || "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Session</p>
              <p className="mt-1.5 text-[13px] text-zinc-100">{(row.session_tag as string | null) ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Market condition</p>
              <p className="mt-1.5 text-[13px] text-zinc-100">{(row.market_condition as string | null) ?? "—"}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          eyebrow="Behavior"
          title={row.mood_state ?? "No mood tagged"}
          description="Discipline checks for this completed day."
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: "Followed plan", ok: Boolean(row.followed_plan) },
              { label: "Respected stop", ok: Boolean(row.respected_stop) },
              { label: "No revenge trade", ok: Boolean(row.no_revenge_trade) },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-[12px]",
                  item.ok
                    ? "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-100"
                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400",
                )}
              >
                <p>{item.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em]">{item.ok ? "Yes" : "No"}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard eyebrow="Review notes" title="What happened today" description="Your note, one lesson, and linked chart actions.">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Note</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{(row.note as string | null) ?? "No note added."}</p>
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">One lesson</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {(row.lesson_learned as string | null) ?? "No lesson added."}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Linked chart</p>
          {chartUrl ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="max-w-full break-all text-sm text-zinc-400">{chartUrl}</p>
              <a
                href={chartUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                Open chart
                <ExternalLink className="ml-2 size-4" />
              </a>
              <button
                type="button"
                onClick={() => void copyChartLink(chartUrl)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No chart link saved for this entry.</p>
          )}
        </div>
      </DashboardCard>

      {(prevEntry || nextEntry || sameDayEntries.length > 0) ? (
        <DashboardCard
          eyebrow="Navigation"
          title="Move through entries"
          description="Previous/next flow with same-day entries when multiple were logged."
        >
          <div className="flex flex-wrap gap-2">
            {prevEntry ? (
              <Link
                href={`/app/journal/${prevEntry.id}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                <ArrowLeft className="mr-2 size-4" />
                Previous
              </Link>
            ) : null}
            {nextEntry ? (
              <Link
                href={`/app/journal/${nextEntry.id}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                Next
                <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : null}
          </div>
          {sameDayEntries.length > 0 ? (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Same-day entries</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sameDayEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/app/journal/${entry.id}`}
                    className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100"
                  >
                    {(entry.entryDate ?? "—")} · {entry.sym} · {entry.r}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </DashboardCard>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => {
          if (deleting) return;
          setConfirmOpen(false);
        }}
        onConfirm={() => void onDelete()}
        destructive
        pending={deleting}
        title="Delete journal entry?"
        description="This action is permanent and cannot be undone."
        confirmLabel="Delete entry"
      />
    </div>
  );
}
