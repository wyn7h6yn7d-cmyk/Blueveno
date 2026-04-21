/**
 * Homepage CTA system — intent-driven hierarchy, minimal label repetition.
 *
 * All hash links use the `/<path>#anchor` form so they resolve correctly from
 * any route (e.g. `/pricing#cta` was broken; `/#cta` always hits the marketing home).
 */

export const marketingCtas = {
  hero: {
    /** Primary — conversion */
    primary: { label: "Join early access", href: "/#cta" as const },
    /** Secondary — product preview on the main marketing page */
    secondary: { label: "Preview the workspace", href: "/#calendar" as const },
    tertiary: { label: "Sign in", href: "/login" as const },
  },
  nav: {
    /** Persistent nav CTA — lands on the final signup strip */
    conversion: { label: "Early access", href: "/#cta" as const },
  },
  productShowcase: {
    intro: { label: "Preview the workspace", href: "/#day" as const },
    rows: [
      { label: "Start free", href: "/signup" as const },
      { label: "Explore analytics", href: "/app/analytics" as const },
      { label: "See how review works", href: "/app/reviews" as const },
      { label: "Preview the workspace", href: "/#calendar" as const },
      { label: "Join early access", href: "/#cta" as const },
      { label: "Get access", href: "/#cta" as const },
      { label: "See plans", href: "/pricing" as const },
      { label: "See session recaps", href: "/app/journal" as const },
    ],
    pricing: { label: "Compare plans", href: "/pricing" as const },
  },
  outcomes: {
    loop: { label: "See the operating loop", href: "/#core" as const },
  },
  workflow: {
    explore: { label: "Explore analytics", href: "/app/analytics" as const },
    plans: { label: "Plans & pricing", href: "/pricing" as const },
  },
  traderTypes: {
    review: { label: "See how review works", href: "/app/reviews" as const },
  },
  testimonials: {
    next: { label: "Start free", href: "/signup" as const },
  },
  faq: {
    close: { label: "Join early access", href: "/#cta" as const },
  },
  finalCta: {
    eyebrow: "Limited onboarding",
    primary: { label: "Get access", href: "mailto:hello@blueveno.com?subject=Blueveno%20access" as const },
    secondary: { label: "Start free", href: "/signup" as const },
    tertiary: { label: "Sign in", href: "/login" as const },
  },
} as const;
