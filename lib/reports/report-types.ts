export type ReportTypeId =
  | "weekly_report"
  | "monthly_report"
  | "account_report"
  | "behavior_report"
  | "trades_export";

export type ReportTypeMeta = {
  id: ReportTypeId;
  label: string;
  description: string;
  suggestedPreset?: "7d" | "30d" | "90d";
};

export const REPORT_TYPES: ReportTypeMeta[] = [
  {
    id: "weekly_report",
    label: "Weekly report",
    description: "P&L, win rate, discipline, and weekly focus for the selected period.",
    suggestedPreset: "7d",
  },
  {
    id: "monthly_report",
    label: "Monthly report",
    description: "Month-level review with best/worst days and reflection notes.",
    suggestedPreset: "30d",
  },
  {
    id: "account_report",
    label: "Account report",
    description: "Compare net P&L, win rate, and discipline across trading accounts.",
  },
  {
    id: "behavior_report",
    label: "Behavior report",
    description: "Discipline scores, mood patterns, and coaching insights.",
    suggestedPreset: "30d",
  },
  {
    id: "trades_export",
    label: "Trades export",
    description: "Preview and export journal entries as CSV for the selected period.",
  },
];

export type ReportTableRow = Record<string, string | number | null>;

export type PeriodReportSnapshot = {
  reportType: ReportTypeId;
  reportLabel: string;
  periodLabel: string;
  from: string;
  to: string;
  hasData: boolean;
  netPnl: number;
  tradeCount: number;
  tradedDays: number;
  winRate: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number; label: string } | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  disciplineScore: number | null;
  dominantMood: string | null;
  topSetup: string | null;
  mostCommonMistake: string | null;
  nextFocus: string | null;
  behavioralNotes: string[];
  tableHeaders: Array<{ key: string; label: string }>;
  tableRows: ReportTableRow[];
};
