/**
 * Homepage CTA hierarchy — varied intent, no repeated “Request access” fatigue.
 *
 * 1. Hero — Primary conversion (waitlist) + main exploration (platform) + account entry (sign in).
 * 2. Nav — Short, persistent conversion (“Get access”) + standard auth links elsewhere in nav.
 * 3. Mid-page — After Platform strip: deepen into product (“Explore analytics in depth”).
 * 4. Deep dives end — Commercial / next step (“View plans & pricing”).
 * 5. Section utility — Loop (Outcomes→Workflow), personas (review), social proof (Testimonials), FAQ (waitlist).
 * 6. Final band — Strong conversion (“Get access” + “Start free”) + returning users (“Sign in”).
 */

export const marketingCtas = {
  hero: {
    /** Primary conversion — waitlist / early access */
    primary: { label: "Join early access", href: "#cta" as const },
    /** Exploration — capability grid + preview */
    secondary: { label: "View the platform", href: "#platform" as const },
    /** Returning users */
    tertiary: { label: "Sign in", href: "/login" as const },
  },
  nav: {
    /** Persistent nav CTA — short, high intent */
    conversion: { label: "Get access", href: "#cta" as const },
  },
  featureGrid: {
    /** Mid-page: scroll into product depth */
    exploreDepth: { label: "Explore analytics in depth", href: "#product-depth" as const },
  },
  deepDives: {
    /** After product story — commercial exploration */
    pricing: { label: "View plans & pricing", href: "/pricing" as const },
  },
  outcomes: {
    /** Section utility — explain motion */
    loop: { label: "See how the loop works", href: "#workflow" as const },
  },
  workflow: {
    /** Section utility — plans */
    plans: { label: "View plans & pricing", href: "/pricing" as const },
  },
  traderTypes: {
    /** Persona section — review promise */
    review: { label: "See how review works", href: "#product-depth" as const },
  },
  testimonials: {
    /** Social proof → conversion */
    join: { label: "Join early access", href: "#cta" as const },
  },
  faq: {
    /** FAQ footer — short conversion nudge */
    waitlist: { label: "Get access", href: "#cta" as const },
  },
  finalCta: {
    eyebrow: "Limited onboarding",
    primary: { label: "Get access", href: "mailto:hello@blueveno.com?subject=Blueveno%20access" as const },
    secondary: { label: "Start free", href: "/signup" as const },
    tertiary: { label: "Sign in", href: "/login" as const },
  },
} as const;
