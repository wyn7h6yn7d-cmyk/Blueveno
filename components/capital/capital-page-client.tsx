"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { PageHeader } from "@/components/v2/layout";
import { ChartCard, SectionCard, TableCard } from "@/components/v2/cards";
import { BarChart, LineAreaChart, ProgressGoalBar } from "@/components/v2/charts";
import { InsightList, KpiGrid, MetricCard, StatusPill } from "@/components/v2";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import { DataTable, type DataTableColumn } from "@/components/v2/ui/data-table";
import { PnlCell } from "@/components/v2/tables";
import { useCapitalData } from "@/lib/capital/use-capital-data";
import type { LinkedAccountCapitalRow } from "@/lib/capital/compute-capital-progress";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function CapitalPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const data = useCapitalData(userId, initialWorkspace);
  const currency = data.activeAccount?.currency ?? displayCurrency;
  const progress = data.progress;

  const monthlyChart = progress.monthlyCapital.map((m) => ({
    day: m.label,
    pnl: m.pnl,
  }));

  const linkedColumns: DataTableColumn<LinkedAccountCapitalRow>[] = [
    {
      id: "name",
      header: "Account",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-zinc-200">{row.name}</span>
          {row.isActive ? <StatusPill tone="active" dot>Active</StatusPill> : null}
        </div>
      ),
    },
    { id: "type", header: "Type", cell: (row) => <span className="text-[12px] text-zinc-400">{row.accountType}</span> },
    {
      id: "net",
      header: "Journal P&L",
      cell: (row) => <PnlCell value={row.netPnl} currency={row.currency} />,
      sortable: true,
      sortValue: (row) => row.netPnl,
    },
    {
      id: "balance",
      header: "Est. balance",
      cell: (row) =>
        row.estimatedBalance !== null ? (
          <span className="font-mono text-[12px] text-zinc-200">{formatSignedPnlAmount(row.estimatedBalance, row.currency)}</span>
        ) : (
          <span className="text-[12px] text-zinc-500">Set starting balance</span>
        ),
    },
    {
      id: "days",
      header: "Days",
      cell: (row) => <span className="font-mono text-[12px] text-zinc-400">{row.tradedDays}</span>,
      sortable: true,
      sortValue: (row) => row.tradedDays,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Account progress"
        title="Capital"
        description="Journal-derived balance and pacing for your active trading account. Not connected to your broker."
        actions={
          <Link href="/app/settings?section=accounts" className={appSecondaryCta}>
            <Settings className="mr-1.5 size-3.5" />
            Account settings
          </Link>
        }
      />

      {!data.ready ? (
        <EmptyStatePanel title="Loading capital data" description="Preparing account and journal history." compact />
      ) : !data.hasAccounts ? (
        <EmptyStatePanel
          title="No trading accounts"
          description="Create a trading account in Settings to start tracking capital progress from your journal."
          action={
            <Link href="/app/settings?section=accounts&new=1" className={cn(appSecondaryCta, "mt-2")}>
              Add trading account
            </Link>
          }
        />
      ) : (
        <>
          <KpiGrid columns={4}>
            <MetricCard
              label="Estimated balance"
              value={
                progress.estimatedBalance !== null
                  ? formatSignedPnlAmount(progress.estimatedBalance, currency)
                  : progress.hasJournalData
                    ? formatSignedPnlAmount(progress.netPnl, currency)
                    : "—"
              }
              hint={
                progress.startingBalance !== null
                  ? `Starting ${formatSignedPnlAmount(progress.startingBalance, currency)}`
                  : "Set starting balance in Settings"
              }
              tone={progress.netPnl > 0 ? "positive" : progress.netPnl < 0 ? "negative" : "neutral"}
            />
            <MetricCard
              label="Journal P&L"
              value={progress.hasJournalData ? formatSignedPnlAmount(progress.netPnl, currency) : "—"}
              tone={progress.netPnl > 0 ? "positive" : progress.netPnl < 0 ? "negative" : "neutral"}
            />
            <MetricCard
              label="Return vs start"
              value={progress.returnPct !== null ? `${progress.returnPct >= 0 ? "+" : ""}${progress.returnPct.toFixed(1)}%` : "—"}
            />
            <MetricCard
              label="Peak balance"
              value={progress.peakEquity !== null ? formatSignedPnlAmount(progress.peakEquity, currency) : "—"}
            />
          </KpiGrid>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              eyebrow="Targets"
              title="Profit pacing"
              description="Optional reference target from your recorded starting balance — not a firm or broker rule."
            >
              {progress.profitTarget !== null ? (
                <ProgressGoalBar
                  value={Math.max(0, progress.netPnl)}
                  goal={progress.profitTarget}
                  label={progress.profitTargetLabel ?? "Pacing target"}
                  hint={`Target: ${formatSignedPnlAmount(progress.profitTarget, currency)} · Journal profit logged: ${formatSignedPnlAmount(Math.max(0, progress.netPnl), currency)}`}
                />
              ) : (
                <EmptyStatePanel
                  title="Starting balance required"
                  description="Set a starting balance on this account to show a pacing target and estimated balance curve."
                  compact
                  action={
                    <Link href="/app/settings?section=accounts" className="text-[12px] text-bv-ice hover:underline">
                      Open account settings
                    </Link>
                  }
                />
              )}
            </SectionCard>

            <SectionCard
              eyebrow="Protection"
              title="Drawdown from peak"
              description="Largest dip in estimated balance based on logged journal days."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Current dip"
                  value={
                    progress.currentDrawdown !== null && progress.currentDrawdown < 0
                      ? formatSignedPnlAmount(progress.currentDrawdown, currency)
                      : "At peak"
                  }
                  tone={progress.currentDrawdown !== null && progress.currentDrawdown < 0 ? "caution" : "positive"}
                />
                <MetricCard
                  label="Max dip"
                  value={
                    progress.maxDrawdown !== null && progress.maxDrawdown < 0
                      ? formatSignedPnlAmount(progress.maxDrawdown, currency)
                      : "—"
                  }
                  tone="caution"
                />
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
                This reflects journal P&L swings from your peak estimated balance. It is not trailing drawdown or prop-firm
                compliance logic.
              </p>
            </SectionCard>
          </div>

          <ChartCard
            eyebrow="Curve"
            title="Estimated capital curve"
            description={
              progress.startingBalance !== null
                ? "Starting balance plus cumulative journal P&L by traded day."
                : "Cumulative journal P&L by traded day (set starting balance for balance view)."
            }
            hasData={progress.equityCurve.length >= 2}
            emptyTitle="Not enough data"
            emptyDescription="Log more trading days to draw a capital curve."
          >
            <LineAreaChart data={progress.equityCurve} xKey="day" yKey="pnl" variant="area" height={280} />
          </ChartCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              eyebrow="Monthly"
              title="Monthly journal P&L"
              description="Month-by-month result for the active account."
              hasData={monthlyChart.length > 0}
              emptyTitle="No monthly data"
              emptyDescription="Log journal entries across months to see breakdown."
            >
              <BarChart data={monthlyChart} xKey="day" yKey="pnl" height={220} colorBySign />
            </ChartCard>

            <SectionCard eyebrow="Intelligence" title="Account pacing notes">
              <InsightList
                items={progress.insights.map((body, i) => ({
                  id: `insight-${i}`,
                  title: "Insight",
                  body,
                  severity: "info" as const,
                }))}
                empty={
                  <EmptyStatePanel
                    title="No pacing notes yet"
                    description="Log journal entries to generate capital pacing insights."
                    compact
                  />
                }
              />
            </SectionCard>
          </div>

          {data.linkedAccounts.length > 1 ? (
            <TableCard eyebrow="Accounts" title="Linked accounts" description="Journal-derived progress across your accounts.">
              <DataTable
                columns={linkedColumns}
                rows={data.linkedAccounts}
                getRowKey={(row) => row.id}
              />
            </TableCard>
          ) : null}

          {data.activeAccount ? (
            <p className="text-center text-[12px] text-zinc-500">
              Tracking <span className="text-zinc-300">{data.activeAccount.name}</span> ({data.activeAccount.accountType})
              · Estimates use journal data only
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
