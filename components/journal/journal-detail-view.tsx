"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccess } from "@/components/access/access-provider";
import type { JournalRowDb } from "@/lib/user-data/map-journal-db";

type Props = {
  row: JournalRowDb;
};

export function JournalDetailView({ row }: Props) {
  const { displayCurrency } = useAccess();
  const chartUrl = row.tradingview_url as string | null;
  const rawPnl = String(row.r_value ?? "");
  const pnlNum = parsePnlAmount(rawPnl);
  const pnlTitle = pnlNum !== null ? formatSignedPnlAmount(pnlNum, displayCurrency) : rawPnl;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Journal day"
        title={`${row.symbol} · ${(row.entry_date as string | null) ?? row.entry_time}`}
        description="Simple day detail view with note and chart link."
        actions={
          <div className="flex flex-wrap items-center gap-2">
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
            <Link
              href="/app/journal"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              Back to journal
            </Link>
          </div>
        }
      />

      <DashboardCard
        eyebrow="Day detail"
        title={pnlTitle}
        description={`Setup: ${row.setup} · Tag: ${row.tag}`}
      >
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Symbol</dt>
            <dd className="mt-2 text-zinc-100">{row.symbol}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Date</dt>
            <dd className="mt-2 text-zinc-100">{(row.entry_date as string | null) ?? row.entry_time}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Note</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{(row.note as string | null) ?? "No note added."}</p>
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">TradingView</p>
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
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No chart link added yet.</p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
