# Blueveno

Premium **blue-toned** trading journal and performance analytics SaaS.

**Positioning:** turn trade data into clarity, discipline, and repeatable edge.

## Stack

| Layer | Choice |
|--------|--------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + design tokens in `app/globals.css` |
| UI | shadcn/ui (Base UI primitives) |
| Auth | NextAuth (see `auth.ts`, `app/api/auth/`) |
| Billing | Stripe-ready scaffolding (`lib/billing/`, `docs/BILLING.md`) |

## Project structure

```
app/
  (marketing)/           # Public site — home, pricing
  (auth)/                # login, signup
  (application)/app/   # Protected workspace (middleware)
  api/                   # auth, webhooks (Stripe)
components/
  landing/               # Marketing sections + shared MarketingBackground
  app/                   # App shell, page chrome, dashboard cards
  dashboard/             # Reusable workstation widgets (metrics, rules, accounts)
  billing/               # Feature gates + upgrade UI
  ui/                    # shadcn components
lib/
  product.ts             # Tagline + capability list (single source)
  billing/               # Plans, entitlements, Stripe config
  features.ts            # Feature keys for gating
middleware.ts            # Protects /app/*
```

## Routes

| Route | Purpose |
|--------|---------|
| `/` | Marketing homepage |
| `/pricing` | Plans (Free / Pro / Elite) |
| `/login`, `/signup` | Auth |
| `/app` | Journal — P&L, calendar, entries |
| `/app/journal/[id]` | Single day detail |
| `/app/analytics` | Performance analytics |
| `/app/playbooks` | Tags & playbooks |
| `/app/reviews` | Screenshots & recaps |
| `/app/settings` | Workspace + link to billing |
| `/app/settings/billing` | Stripe Customer Portal (when configured) |

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Environment

- Copy `.env.example` to `.env` if present; configure `AUTH_SECRET`, OAuth or credentials, and Stripe keys per `docs/BILLING.md`.
- Demo auth: see `AUTH_DEMO` hint on login when enabled.

## Design

Visual system is documented in `docs/DESIGN_SYSTEM.md`: dark navy base, electric blue accents, layered backgrounds, terminal-grade density.
