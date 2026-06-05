import { toDayKey } from "@/lib/user-data/journal-metrics";

export type DateRangePreset = "7d" | "30d" | "90d" | "all" | "custom";

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  all: "All",
  custom: "Custom",
};

export function presetToDateRange(preset: DateRangePreset, now = new Date()): { from: string; to: string } {
  if (preset === "all") return { from: "", to: "" };
  const to = toDayKey(now);
  const fromDate = new Date(now);
  if (preset === "7d") fromDate.setDate(now.getDate() - 6);
  else if (preset === "30d") fromDate.setDate(now.getDate() - 29);
  else if (preset === "90d") fromDate.setDate(now.getDate() - 89);
  return { from: toDayKey(fromDate), to };
}

export function detectDatePreset(from: string, to: string, now = new Date()): DateRangePreset {
  if (!from && !to) return "all";
  for (const preset of ["7d", "30d", "90d"] as const) {
    const range = presetToDateRange(preset, now);
    if (range.from === from && range.to === to) return preset;
  }
  return "custom";
}
