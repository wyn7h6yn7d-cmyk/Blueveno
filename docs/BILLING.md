# Billing & entitlements (Stripe-ready scaffolding)

This document describes the **abstraction layer** for subscriptions and feature gating. **Stripe Checkout and webhooks are not fully wired** — the codebase is structured so you can plug them in without rewiring the app.

## Folder structure

```
lib/billing/
  types.ts           # PlanTier, SubscriptionSnapshot, SubscriptionStatus
  plans.ts           # PLANS (Free / Pro / Elite), marketing copy, env key names
  matrix.ts          # MIN_TIER_FOR_FEATURE, TIER_RANK
  resolve.ts         # getEffectivePlanTier, getSubscriptionSnapshot (JWT + env override)
  entitlements.ts    # hasFeature, canUse* helpers
  copy.ts            # FEATURE_UPGRADE_COPY — upgrade UI strings
  gate.server.ts     # requireFeature, checkFeature (server-only redirects)
  stripe.ts          # Lazy Stripe SDK client
  stripe-config.ts   # Price ID accessors from env
  index.ts           # Public exports

lib/features.ts      # FEATURE_KEYS union — keep in sync with matrix.ts

lib/feature-flags.ts # Env flags (e.g. FEATURE_AI_INSIGHTS) — orthogonal to paid tiers

components/billing/
  gated-server.tsx   # <GatedServer feature=… fallback=… />
  gated-client.tsx   # <GatedClient allowed={…} />
  upgrade-modal.tsx  # Placeholder modal (Checkout body later)
  upgrade-cta.tsx      # Inline CTA block

components/app/upgrade-prompt.tsx  # Full-width upgrade strip (uses copy.ts)
```

## Plan tiers

| Tier   | Intent                          |
|--------|----------------------------------|
| `free` | Default; limited journal, baseline analytics |
| `pro`  | Unlimited journal, advanced analytics, screenshot review, playbooks |
| `elite`| Pro + premium reports, AI insights (also behind feature flags) |

**Source of truth for “who has what”:** `lib/billing/matrix.ts` → `MIN_TIER_FOR_FEATURE`.

## Feature keys (`lib/features.ts`)

| Key | Min tier |
|-----|----------|
| `journal.unlimited` | Pro |
| `analytics.advanced` | Pro |
| `reviews.screenshot` | Pro |
| `playbooks.full` | Pro |
| `reports.premium` | Elite |
| `ai.insights` | Elite |

## Helper patterns

### Server Components / pages

```ts
import { auth } from "@/auth";
import { hasFeature } from "@/lib/billing/entitlements";

const session = await auth();
const ok = hasFeature(session, "analytics.advanced");
```

### Hard redirect (e.g. premium-only route)

```ts
import { requireFeature } from "@/lib/billing/gate.server";

export default async function PremiumPage() {
  await requireFeature("reports.premium", { redirectTo: "/pricing" });
  // ...
}
```

### Hide sections, show upgrade UI

```tsx
import { GatedServer } from "@/components/billing/gated-server";
import { UpgradeCta } from "@/components/billing/upgrade-cta";

<GatedServer feature="ai.insights" fallback={<UpgradeCta feature="ai.insights" />}>
  <AiInsightsPreview />
</GatedServer>
```

### Server Actions / Route Handlers

```ts
import { assertFeature } from "@/lib/permissions";
import { auth } from "@/auth";

const session = await auth();
assertFeature(session, "journal.unlimited");
```

## Session / JWT

- Optional `session.user.planTier`: `free` | `pro` | `elite` (see `types/next-auth.d.ts`).
- **Demo / staging:** set `BILLING_PLAN_TIER_OVERRIDE=pro|elite|free` to simulate a tier without a database.
- **Strict entitlements in development:** set `BILLING_STRICT=true` (otherwise dev bypasses gates for velocity).

## Feature flags (`lib/feature-flags.ts`)

Paid tier ≠ rollout flag. Example: `FEATURE_AI_INSights` can stay off until the model is ready, even for Elite users. Combine `hasFeature(session, "ai.insights") && isAiInsightsFlagEnabled()` at the UI boundary.

## Stripe integration checklist (future)

1. Create Products / Prices in Stripe Dashboard; set env:
   - `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
   - `STRIPE_PRICE_ELITE_MONTHLY`, `STRIPE_PRICE_ELITE_YEARLY`
2. On successful Checkout / `customer.subscription.updated` webhook:
   - Persist subscription row (userId, stripeSubscriptionId, status, currentPeriodEnd, priceId).
   - Map Price ID → `PlanTier`; set `planTier` on user or encode in JWT at login.
3. Implement `POST /api/billing/checkout` (create Checkout Session) and `POST /api/billing/portal` (Customer Portal).
4. Replace placeholders in `app/(application)/app/settings/billing/page.tsx` with live subscription data.
5. Remove or narrow `BILLING_PLAN_TIER_OVERRIDE` usage in production.

## UI placeholders

- **Pricing:** `app/(marketing)/pricing/page.tsx` — three columns from `PLANS`.
- **Upgrade:** `UpgradeModal`, `UpgradeCta`, `UpgradePrompt` — copy from `FEATURE_UPGRADE_COPY`.
- **Billing settings:** snapshot from `getSubscriptionSnapshot()` until DB exists.
