"use client";

import { track } from "@vercel/analytics";
import {
  PRODUCT_ANALYTICS_EVENTS,
  sanitizeProductAnalyticsProps,
  type ProductAnalyticsEvent,
  type ProductAnalyticsProps,
} from "@/lib/analytics/product-events";

/** Fire a privacy-safe product event (client-only, no financial or journal content). */
export function trackProductEvent(event: ProductAnalyticsEvent, properties?: ProductAnalyticsProps): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeProductAnalyticsProps(properties);
  track(event, safe);
}

export function trackReadOnlyBlockedAction(context: string): void {
  const slug = context
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.readOnlyBlocked, { context: slug || "unknown" });
}

export function trackPremiumRequestClicked(source: string): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.premiumRequestClicked, {
    source: source
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 40),
  });
}

export function trackExportCsvClicked(exportType: ProductAnalyticsProps["export_type"], surface: string): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.exportCsvClicked, { export_type: exportType, surface });
}
