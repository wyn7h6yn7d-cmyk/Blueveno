import type { FeatureKey } from "@/lib/features";

/** Upgrade surfaces — titles & descriptions for CTAs and modals */
export const FEATURE_UPGRADE_COPY: Record<
  FeatureKey,
  { title: string; description: string; minPlan: "Pro" | "Elite" }
> = {
  "journal.unlimited": {
    title: "Unlimited journal entries",
    description: "Log every execution without caps—fills, tags, and artifacts stay complete.",
    minPlan: "Pro",
  },
  "analytics.advanced": {
    title: "Advanced analytics",
    description: "Regime slices, distributions, and deeper attribution on the same record.",
    minPlan: "Pro",
  },
  "reviews.screenshot": {
    title: "Screenshot review",
    description: "Chart state bound to fills, structured recaps, and exportable review packs.",
    minPlan: "Pro",
  },
  "playbooks.full": {
    title: "Playbooks",
    description: "If-then rules, adherence tracking, and desk constraints beside execution.",
    minPlan: "Pro",
  },
  "reports.premium": {
    title: "Premium reports",
    description: "PDF packs, scheduled exports, and branded desk-ready summaries.",
    minPlan: "Elite",
  },
  "ai.insights": {
    title: "AI insights",
    description: "Narrative recap and pattern hints—released gradually by tier and feature flags.",
    minPlan: "Elite",
  },
};
