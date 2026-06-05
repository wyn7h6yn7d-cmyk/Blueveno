"use client";

import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { formatReportDayLabel } from "@/lib/reports/build-period-report";
import type { PeriodReportSnapshot } from "@/lib/reports/report-types";
import { SectionCard } from "@/components/v2/cards";
import { InsightList, KpiGrid, LabelValueRow, MetricCard } from "@/components/v2";
import { EmptyState } from "@/components/v2/design-system";
import { DataTable, type DataTableColumn } from "@/components/v2/ui/data-table";
import { PnlCell } from "@/components/v2/tables";

type ReportPreviewPanelProps = {
  report: PeriodReportSnapshot;
  currency: string;
  className?: string;
};

function fmtPnl(value: number | null, currency: string): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return formatSignedPnlAmount(value, currency);
}

export function ReportPreviewPanel({ report, currency, className }: ReportPreviewPanelProps) {
  if (!report.hasData) {
    return (
      <EmptyState
        title="No data for this period"
        description="Widen the date range, change account scope, or log more trading days."
        compact
      />
    );
  }

  const columns: DataTableColumn<Record<string, string | number | null>>[] = report.tableHeaders.map((h) => ({
    id: h.key,
    header: h.label,
    cell: (row) => {
      const value = row[h.key];
      if ((h.key.includes("pnl") || h.key === "total_pnl" || h.key === "avg_pnl" || h.key === "net_pnl") && typeof value === "number") {
        return <PnlCell value={value} currency={currency} />;
      }
      return <span className="font-mono text-[12px] text-zinc-300">{value === null || value === undefined ? "—" : String(value)}</span>;
    },
    sortable: typeof report.tableRows[0]?.[h.key] === "number",
    sortValue: (row) => {
      const v = row[h.key];
      return typeof v === "number" ? v : typeof v === "string" ? v : null;
    },
  }));

  return (
    <div id="report-print-root" className={className}>
      <KpiGrid columns={4}>
        <MetricCard
          label="Net P&L"
          value={fmtPnl(report.netPnl, currency)}
          tone={report.netPnl > 0 ? "positive" : report.netPnl < 0 ? "negative" : "neutral"}
        />
        <MetricCard label="Traded days" value={String(report.tradedDays)} hint={`${report.tradeCount} entries`} />
        <MetricCard label="Win rate" value={report.winRate !== null ? `${report.winRate}%` : "—"} />
        <MetricCard
          label="Discipline"
          value={report.disciplineScore !== null ? `${report.disciplineScore}%` : "—"}
          tone={
            report.disciplineScore !== null && report.disciplineScore >= 70
              ? "positive"
              : report.disciplineScore !== null && report.disciplineScore < 50
                ? "negative"
                : "neutral"
          }
        />
      </KpiGrid>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <KpiGrid columns={2}>
          <MetricCard label="Avg green day" value={fmtPnl(report.avgGreenDay, currency)} tone="positive" />
          <MetricCard label="Avg red day" value={fmtPnl(report.avgRedDay, currency)} tone="negative" />
          <MetricCard label="Dominant mood" value={report.dominantMood ?? "—"} />
          <MetricCard label="Best setup" value={report.topSetup ?? "—"} />
        </KpiGrid>

        <SectionCard eyebrow="Period" title={report.reportLabel}>
          <div className="space-y-2">
            <LabelValueRow label="Period" value={report.periodLabel} dense />
            <LabelValueRow
              label="Best day"
              value={report.bestDay ? `${formatReportDayLabel(report.bestDay.date)} · ${fmtPnl(report.bestDay.pnl, currency)}` : "—"}
              dense
            />
            <LabelValueRow
              label={report.worstDay?.label ?? "Worst day"}
              value={report.worstDay ? `${formatReportDayLabel(report.worstDay.date)} · ${fmtPnl(report.worstDay.pnl, currency)}` : "—"}
              dense
            />
            <LabelValueRow label="Most common mistake" value={report.mostCommonMistake ?? "—"} dense />
            <LabelValueRow label="Next focus" value={report.nextFocus?.trim() || "Not set"} dense />
          </div>
        </SectionCard>
      </div>

      {report.behavioralNotes.length > 0 ? (
        <div className="mt-5">
          <SectionCard eyebrow="Notes" title="Behavior & context">
            <InsightList
              items={report.behavioralNotes.map((body, i) => ({
                id: `note-${i}`,
                title: "Insight",
                body,
                severity: "info" as const,
              }))}
            />
          </SectionCard>
        </div>
      ) : null}

      {report.tableRows.length > 0 ? (
        <div className="mt-5">
          <SectionCard eyebrow="Tables" title="Report data" contentClassName="p-0 sm:p-0">
            <DataTable
              columns={columns}
              rows={report.tableRows}
              getRowKey={(row) => report.tableHeaders.map((h) => String(row[h.key] ?? "")).join("|")}
            />
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
