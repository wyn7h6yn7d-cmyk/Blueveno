# Blueveno — Product & Technical Architecture

This document defines the product system, app structure, design direction, data/auth/billing strategy, and implementation order for a launch-ready SaaS foundation.

---

## 1. Product architecture

**Positioning:** Blueveno is a premium **trading journal + performance analytics** platform for serious traders—data-native, calm, institutionally credible (not crypto-bro, not gambling UI).

**Core domains (bounded contexts):**

| Domain | Responsibility |
|--------|------------------|
| **Identity & access** | Users, sessions, organizations (future), roles |
| **Journal** | Trades, sessions, notes, screenshots, tags |
| **Analytics** | Performance metrics, distributions, streaks, expectancy |
| **Behavior** | Emotional check-ins, mistake taxonomy, rule violations |
| **Playbooks** | Setup definitions, if/then rules, adherence tracking |
| **Accounts** | Broker/prop accounts, balances, guardrails |
| **Billing** | Subscriptions, entitlements, Stripe objects |
| **Marketing** | Public site, SEO, conversion |

**Product pillars → future modules:**

- Automatic trade journaling → Ingestion + `JournalEntry` pipeline  
- Analytics & dashboards → `Metrics` + chart APIs  
- Setup tagging & playbooks → `Tag`, `Playbook`, `AdherenceEvent`  
- Screenshots & annotations → `Media` + `Annotation`  
- Behavioral / emotional journaling → `MoodLog`, `BehaviorSignal`  
- Session recaps → `SessionRecap` (generated + edited)  
- Mistake & rule tracking → `Mistake`, `RuleViolation`  
- Account tracking → `TradingAccount`  
- Paid access → `Subscription` + Stripe Customer/Subscription IDs  

---

## 2. Page / app architecture (routes)

**Route groups** keep marketing, auth, and app surfaces isolated while sharing one Next.js app.

```
app/
├── (marketing)/          # Public site — strong storytelling, SEO
│   ├── layout.tsx
│   └── page.tsx          # Homepage (TradeZella-style system, Blueveno brand)
├── (auth)/               # Minimal chrome — sign in / sign up
│   ├── layout.tsx
│   └── login/page.tsx
├── (dashboard)/         # Logged-in product shell (sidebar + header)
│   ├── layout.tsx
│   ├── dashboard/page.tsx        # Overview / KPIs
│   ├── journal/page.tsx          # Journal list (placeholder)
│   ├── analytics/page.tsx
│   ├── playbooks/page.tsx
│   ├── behavior/page.tsx
│   ├── accounts/page.tsx
│   └── settings/
│       ├── page.tsx
│       └── billing/page.tsx      # Stripe Customer Portal entry (future)
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── webhooks/stripe/route.ts  # Signature verify + idempotency (stub)
├── layout.tsx            # Root: fonts, dark class, providers
└── globals.css           # Design tokens + shadcn theme
```

**Future additions (same pattern):** `/register`, `/onboarding`, `/pricing`, `/legal/*`, `/api/trpc/*` or `/api/rest/*`, `/api/inngest/*` for async jobs.

---

## 3. Design system direction

**Principles**

- **Dark-first:** Default theme is dark; tokens assume `html.dark` or `.dark`.  
- **Blue-led palette:** Primary actions and focus rings use a controlled blue (not teal-neon, not hyper-saturated crypto gradients).  
- **Layered depth:** Base void → subtle grid/noise → elevated surfaces → glass only on overlays (modals, command surfaces).  
- **Typography:** Strong hierarchy—display font for marketing headlines, neutral sans for UI, mono for data/terminal moments.  
- **Motion:** Restrained—section reveals, micro-interactions on controls; respect `prefers-reduced-motion`.  
- **Credibility:** “Terminal-inspired” charts and KPIs without looking like a game HUD.

**Implementation:** Tailwind CSS v4 + **shadcn/ui** (Base UI primitives) mapped through CSS variables in `app/globals.css`. Components live under `components/ui/*`; product-specific blocks under `components/dashboard/*`, `components/landing/*`.

---

## 4. Information architecture

**Marketing (unauthenticated)**

- Hero promise → Trust → Outcomes → Features → Deep dives → Workflow → Personas → Social proof → FAQ → CTA → Footer.  
- Primary conversion: **Request access / Get early access** → mailto or waitlist (swap for form + CRM later).

**App (authenticated)**

- **Dashboard:** Session snapshot, KPI strip, quick links, “what to review today.”  
- **Journal:** Chronological trade stream, filters, entry detail.  
- **Analytics:** Performance dashboards, R-multiples, win rate by tag/setup.  
- **Playbooks:** Library of rules + adherence.  
- **Behavior:** Mistakes, emotions, rule violations timeline.  
- **Accounts:** Linked accounts, prop guardrails.  
- **Settings:** Profile, notifications, **Billing** (Stripe portal when live).

---

## 5. Authentication & billing architecture

### Authentication (current stack)

- **Auth.js (NextAuth v5)** with **JWT sessions** for speed of iteration.  
- **Credentials provider** gated by env (`AUTH_DEMO_*`) for local/demo—replace with **database-backed credentials** (bcrypt/argon2) or **OAuth** (Google) in production.  
- **Middleware** protects `/dashboard/*`; unauthenticated users redirect to `/login` with `callbackUrl`.  
- **Future:** Add **Prisma + PostgreSQL** (or Drizzle) with `User`, `Account`, `Session` tables; keep the same `auth()` API surface.

### Billing (Stripe) — readiness without locking in

- **Environment:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.  
- **Server-only** Stripe client in `lib/billing/stripe.ts` (instantiated only when keys exist).  
- **Webhook** at `POST /api/webhooks/stripe`: verify signature, handle `checkout.session.completed`, `customer.subscription.*`, idempotent updates to `Subscription` table (stub until DB exists).  
- **Entitlements:** `lib/billing/entitlements.ts` — `canAccessJournal(user)` checks `subscription.status` + feature flags.  
- **UI:** `/dashboard/settings/billing` — placeholder copy + “Manage billing” button wired when Customer Portal is configured.

---

## 6. Launch-ready implementation plan

| Phase | Scope | Outcome |
|-------|--------|---------|
| **A — Foundation** | Route groups, dark blue tokens, shadcn base, env sample | Navigable marketing + app shell |
| **B — Auth** | Auth.js, login page, middleware, session in dashboard | Real sign-in path (demo credentials) |
| **C — Dashboard MVP** | Sidebar, overview page, placeholder module pages | “Opens the box” product feel |
| **D — Billing prep** | Stripe client stub, webhook skeleton, billing page placeholder | Easy Stripe drop-in |
| **E — Data layer** | Prisma/Drizzle schema, migrations, API routes | Persist journal + users |
| **F — Launch hardening** | Rate limits, logging, E2E tests, observability | Production checklist |

**This codebase completes A–D** in code; E–F are documented hooks and types.

### Implementation status (in repo)

- [x] Route groups: `(marketing)`, `(auth)`, `(dashboard)`
- [x] Auth.js (NextAuth v5 beta): `auth.ts`, `/api/auth/[...nextauth]`, JWT session, demo Credentials provider
- [x] Middleware protecting `/dashboard/*`
- [x] Dashboard shell + placeholder module pages
- [x] Stripe client (`getStripe`), webhook route skeleton, billing settings placeholder
- [x] Domain types in `lib/db/types.ts`
- [x] Design tokens: `html.dark`, blue-led `.dark` palette in `globals.css`, shadcn/ui

---

## 7. Implementation order (code)

1. Theme: blue-led `.dark` tokens + `html` class.  
2. Routes: move homepage to `(marketing)`; add `(auth)/login`, `(dashboard)/*`.  
3. Auth.js: `auth.ts`, API route, middleware, login UI.  
4. Dashboard shell: layout + navigation + user menu.  
5. Billing: `lib/billing/*`, webhook route stub, settings billing page.  
6. Domain types: `lib/db/types.ts` for future persistence.  
7. Marketing nav: links to `/login` and `/dashboard` where appropriate.

---

## Repository map (post-implementation)

| Path | Role |
|------|------|
| `auth.ts` | Auth.js configuration |
| `middleware.ts` | Protects dashboard routes |
| `lib/billing/` | Stripe + entitlements stubs |
| `lib/db/types.ts` | Domain types for future ORM |
| `app/(marketing)/` | Public marketing site |
| `app/(auth)/` | Login |
| `app/(dashboard)/` | Product shell + pages |
| `components/landing/` | Marketing sections |
| `components/dashboard/` | App chrome |
| `components/ui/` | shadcn primitives |
