/**
 * Homepage CTA system — intent-driven hierarchy, minimal label repetition.
 *
 * | Layer            | Role |
 * |-----------------|------|
 * | Hero primary    | High-intent waitlist / desk onboarding |
 * | Hero secondary  | Product exploration (workspace preview) |
 * | Hero tertiary   | Returning users (sign in) |
 * | Nav             | Short persistent conversion (not a copy-paste of hero) |
 * | Section links   | Exploratory or next-step (loop, analytics, review, plans) |
 * | Showcase rows   | Rotating intent per surface (signup, anchors, pricing, access) |
 * | Final band      | Human gate + self-serve + sign in |
 */

export const marketingCtas = {
  hero: {
    /** Primary — conversion / waitlist */
    primary: { label: "Join early access", href: "#cta" as const },
    /** Secondary — mid-funnel exploration */
    secondary: { label: "Preview the workspace", href: "#platform" as const },
    tertiary: { label: "Sign in", href: "/login" as const },
  },
  nav: {
    /** Persistent — short label, same destination as hero primary */
    conversion: { label: "Early access", href: "#cta" as const },
  },
  productShowcase: {
    /** Optional jump from intro copy into the first surface */
    intro: { label: "Preview the workspace", href: "#showcase-journal" as const },
    /** One CTA per showcase row — varied intent (index-aligned in ProductShowcase) */
    rows: [
      { label: "Start free", href: "/signup" as const },
      { label: "Explore analytics", href: "#showcase-analytics" as const },
      { label: "See how review works", href: "#showcase-review" as const },
      { label: "Preview the workspace", href: "#platform" as const },
      { label: "Join early access", href: "#cta" as const },
      { label: "Get access", href: "#cta" as const },
      { label: "See plans", href: "/pricing" as const },
      { label: "See session recaps", href: "#showcase-recap" as const },
    ],
    pricing: { label: "Compare plans", href: "/pricing" as const },
  },
  outcomes: {
    loop: { label: "See the operating loop", href: "#workflow" as const },
  },
  workflow: {
    explore: { label: "Explore analytics", href: "#showcase-analytics" as const },
    plans: { label: "Plans & pricing", href: "/pricing" as const },
  },
  traderTypes: {
    review: { label: "See how review works", href: "#showcase-review" as const },
  },
  testimonials: {
    /** After proof — low-friction trial */
    next: { label: "Start free", href: "/signup" as const },
  },
  faq: {
    /** Single strong close — aligns with desk outreach */
    close: { label: "Join early access", href: "#cta" as const },
  },
  finalCta: {
    eyebrow: "Limited onboarding",
    primary: { label: "Get access", href: "mailto:hello@blueveno.com?subject=Blueveno%20access" as const },
    secondary: { label: "Start free", href: "/signup" as const },
    tertiary: { label: "Sign in", href: "/login" as const },
  },
} as const;
