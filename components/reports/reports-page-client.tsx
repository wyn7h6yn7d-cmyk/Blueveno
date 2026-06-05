"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileDown, Printer } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { ReportPreviewPanel } from "@/components/reports/report-preview-panel";
import { EmptyState, LoadingSkeleton } from "@/components/v2/design-system";
import { PageHeader } from "@/components/v2/layout";
import { SectionCard } from "@/components/v2/cards";
import { FilterBar } from "@/components/v2/tables/filter-bar";
import { TopActionBar } from "@/components/v2/layout/top-action-bar";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { trackExportCsvClicked } from "@/lib/analytics/track-product-event";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { entriesToExportRows } from "@/lib/reports/build-period-report";
import { REPORT_TYPES } from "@/lib/reports/report-types";
import { useReportsData } from "@/lib/reports/use-reports-data";
import { DATE_RANGE_PRESET_LABELS, type DateRangePreset } from "@/lib/stats/date-range-presets";
import { applyEntryFilters, EMPTY_ENTRY_FILTERS } from "@/lib/user-data/entry-filters";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { v2FilterPill, v2InsetCell, v2TableRow } from "@/lib/ui/v2-surface";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

const DATE_PRESETS = (["7d", "30d", "90d", "all", "custom"] as DateRangePreset[]).map((id) => ({
  id,
  label: DATE_RANGE_PRESET_LABELS[id],
}));

export function ReportsPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const data = useReportsData(userId, initialWorkspace, displayCurrency);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState<"entries" | "summary" | null>(null);

  const periodEntries = useMemo(
    () => applyEntryFilters(data.sourceEntries, { ...EMPTY_ENTRY_FILTERS, from: data.period.from, to: data.period.to }),
    [data.sourceEntries, data.period.from, data.period.to],
  );

  const onExportEntries = () => {
    if (exportBusy) return;
    setExportBusy("entries");
    setExportMsg(null);
    try {
      if (periodEntries.length === 0) {
        setExportMsg("No entries in the selected period to export.");
        return;
      }
      const rows = entriesToExportRows(periodEntries);
      const headers = Object.keys(rows[0] ?? {}).map((key) => ({ key: key as keyof (typeof rows)[0], label: key }));
      const csv = recordsToCsv(headers, rows);
      trackExportCsvClicked("journal", "reports");
      triggerCsvDownload(`blueveno-trades-export-${fileDate()}.csv`, csv);
      setExportMsg(`Exported ${periodEntries.length} trades for ${data.report.periodLabel}.`);
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export entries.");
    } finally {
      setExportBusy(null);
    }
  };

  const onExportSummary = () => {
    if (exportBusy) return;
    setExportBusy("summary");
    setExportMsg(null);
    try {
      if (!data.report.hasData || data.report.tableRows.length === 0) {
        setExportMsg("No summary table data for this report and period.");
        return;
      }
      const headers = data.report.tableHeaders.map((h) => ({
        key: h.key as keyof (typeof data.report.tableRows)[0],
        label: h.label,
      }));
      const csv = recordsToCsv(headers, data.report.tableRows);
      trackExportCsvClicked("stats_summary", "reports");
      triggerCsvDownload(`blueveno-report-${data.report.reportType}-${fileDate()}.csv`, csv);
      setExportMsg("Summary table export ready.");
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export summary.");
    } finally {
      setExportBusy(null);
    }
  };

  const onPrint = () => {
    if (!data.report.hasData) {
      setExportMsg("Generate a report with data before printing.");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Reports center"
        title="Reports"
        description="Choose a period and account, preview on screen, then export CSV or print."
      />

      {!data.ready ? (
        <LoadingSkeleton variant="chart" className="min-h-48" />
      ) : data.totalEntries === 0 ? (
        <EmptyState
          title="No journal entries yet"
          description="Log a few trading days in Journal, then return here to generate summaries and exports."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="space-y-5">
            <SectionCard eyebrow="Report" title="Report type" description="Choose what to generate for the selected scope.">
              <ul className="space-y-2">
                {REPORT_TYPES.map((type) => {
                  const selected = data.reportType === type.id;
                  return (
                    <li key={type.id}>
                      <button
                        type="button"
                        onClick={() => data.setReportType(type.id, type.suggestedPreset)}
                        className={cn(v2TableRow, "w-full rounded-xl px-3 py-2.5 text-left", selected && "ring-1 ring-[oklch(0.58_0.12_252/0.55)]")}
                      >
                        <p className="text-[13px] font-medium text-zinc-100">{type.label}</p>
                        <p className="mt-1 text-[12px] leading-snug text-zinc-500">{type.description}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>

            <SectionCard eyebrow="Scope" title="Period & account">
              <TopActionBar
                left={
                  <FilterBar
                    options={DATE_PRESETS}
                    value={data.datePreset}
                    onChange={(id) => data.applyDatePreset(id as DateRangePreset)}
                  />
                }
              />
              {data.datePreset === "custom" ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wide text-zinc-500">From</span>
                    <Input
                      type="date"
                      value={data.customFrom}
                      onChange={(e) => data.setCustomFrom(e.target.value)}
                      className={v2InsetCell}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wide text-zinc-500">To</span>
                    <Input
                      type="date"
                      value={data.customTo}
                      onChange={(e) => data.setCustomTo(e.target.value)}
                      className={v2InsetCell}
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-zinc-500">{data.report.periodLabel}</p>
              )}

              <div className={cn(v2FilterPill, "mt-3 h-9 gap-1 px-2")}>
                <select
                  value={data.accountFilter}
                  onChange={(e) => data.setAccountFilter(e.target.value)}
                  className="w-full bg-transparent text-[12px] text-zinc-200 outline-none"
                  aria-label="Account scope"
                >
                  <option value="all">All accounts</option>
                  {data.activeAccountId ? <option value="active">Active account</option> : null}
                  {data.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-3 shrink-0 text-zinc-500" aria-hidden />
              </div>
            </SectionCard>

            <SectionCard eyebrow="Export" title="Download & print" description="CSV and browser print only — PDF export is not available yet.">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onExportEntries}
                  disabled={Boolean(exportBusy)}
                  className={cn(appSecondaryCta, "w-full justify-center")}
                >
                  <FileDown className="mr-1.5 size-3.5" />
                  {exportBusy === "entries" ? "Exporting…" : "CSV — trades export"}
                </button>
                <button
                  type="button"
                  onClick={onExportSummary}
                  disabled={Boolean(exportBusy) || data.reportType === "trades_export"}
                  className={cn(appSecondaryCta, "w-full justify-center")}
                >
                  <FileDown className="mr-1.5 size-3.5" />
                  {exportBusy === "summary" ? "Exporting…" : "CSV — summary tables"}
                </button>
                <button type="button" onClick={onPrint} className={cn(appSecondaryCta, "w-full justify-center")}>
                  <Printer className="mr-1.5 size-3.5" />
                  Print report
                </button>
              </div>
              {exportMsg ? (
                <div className="mt-3">
                  <InlineFeedback message={exportMsg} tone={feedbackToneFromMessage(exportMsg)} />
                </div>
              ) : null}
            </SectionCard>
          </div>

          <SectionCard
            eyebrow="Preview"
            title={data.report.reportLabel}
            description={data.report.periodLabel}
            contentClassName="space-y-5"
          >
            <ReportPreviewPanel report={data.report} currency={displayCurrency} />
          </SectionCard>
        </div>
      )}
    </div>
  );
}
