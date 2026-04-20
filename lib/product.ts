/**
 * Blueveno product positioning — single source for marketing copy and metadata.
 */
export const PRODUCT_NAME = "Blueveno";

export const PRODUCT_TAGLINE = "Turn trade data into clarity";

export const PRODUCT_DESCRIPTION =
  "A premium trading journal and performance analytics workspace: automatic journaling, deep analytics, and review tied to your actual fills.";

/** Core capabilities surfaced across marketing and the app shell (modular / gating-ready). */
export const PRODUCT_CAPABILITIES = [
  { id: "auto-journal", label: "Automatic journaling", detail: "Executions normalized into a coherent record." },
  { id: "analytics", label: "Performance analytics", detail: "Expectancy, distributions, regime slices." },
  { id: "tagging", label: "Setup & strategy tags", detail: "Taxonomy across journal, analytics, review." },
  { id: "screenshots", label: "Screenshot review", detail: "Chart state locked to fills." },
  { id: "recaps", label: "Session recaps", detail: "Structured summaries for desk or coach." },
  { id: "rules", label: "Rule violations", detail: "Desk constraints beside P&L." },
  { id: "accounts", label: "Account tracking", detail: "Risk and buffers in operational view." },
  { id: "premium", label: "Premium tiers", detail: "Stripe-ready plans and feature gates." },
] as const;
