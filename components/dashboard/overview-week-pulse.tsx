"use client";

import { Flame, Shield } from "lucide-react";
import { DonutChart } from "@/components/v2/charts";
import { SectionCard } from "@/components/v2/cards";
import { LabelValueRow, StatStrip } from "@/components/v2";
import { overviewCard, overviewInsetCell } from "@/lib/ui/overview-surface";
import { cn } from "@/lib/utils";

type WeeklyReviewStatus = "review_ready" | "saved" | "set_focus";

type OverviewWeekPulseProps = {
  winningDays: number;
  losingDays: number;
  streak: string;
  disciplineValue: string;
  reviewStatus: WeeklyReviewStatus;
  loading?: boolean;
};

function reviewStatusLabel(status: WeeklyReviewStatus): { label: string; tone: "positive" | "caution" | "neutral" } {
  if (status === "saved") return { label: "Saved", tone: "positive" };
  if (status === "set_focus") return { label: "Set focus", tone: "caution" };
  return { label: "Ready to review", tone: "neutral" };
}

export function OverviewWeekPulse({
  winningDays,
  losingDays,
  streak,
  disciplineValue,
  reviewStatus,
  loading = false,
}: OverviewWeekPulseProps) {
  const hasDays = winningDays + losingDays > 0;
  const review = reviewStatusLabel(reviewStatus);

  return (
    <SectionCard
      eyebrow="This week"
      title="Week pulse"
      description="Green/red split, streak, and review readiness."
      loading={loading}
      contentClassName="space-y-4 p-4 sm:p-5"
      className={cn("h-full", overviewCard)}
    >
      <div className={cn(overviewInsetCell, "flex flex-col items-center px-3 py-4")}>
        <DonutChart
          slices={[
            { id: "green", label: "Green days", value: winningDays },
            { id: "red", label: "Red days", value: losingDays },
          ]}
          height={200}
        />
        {!hasDays ? (
          <p className="mt-2 text-center text-[12px] text-zinc-500">No traded days yet this scope.</p>
        ) : null}
      </div>

      <StatStrip
        items={[
          {
            id: "streak",
            label: "Current streak",
            value: streak,
            tone: streak.includes("green") ? "positive" : streak.includes("red") ? "negative" : "neutral",
            icon: Flame,
          },
          {
            id: "discipline",
            label: "Discipline",
            value: disciplineValue,
            tone: "neutral",
            icon: Shield,
          },
        ]}
      />

      <LabelValueRow
        label="Weekly review"
        value={review.label}
        valueClassName={cn(
          review.tone === "positive" && "text-emerald-200",
          review.tone === "caution" && "text-amber-200",
        )}
        dense
      />
    </SectionCard>
  );
}
