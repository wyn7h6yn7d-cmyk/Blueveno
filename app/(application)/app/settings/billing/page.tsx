import { auth } from "@/auth";
import { getStripe } from "@/lib/billing/stripe";
import { getSubscriptionSnapshot } from "@/lib/billing/resolve";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BillingSettingsPage() {
  const session = await auth();
  const stripeReady = Boolean(getStripe() && process.env.STRIPE_WEBHOOK_SECRET);
  const snap = getSubscriptionSnapshot(session);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Plan & invoices"
        description="Stripe Customer Portal, Checkout, and webhooks. See docs/BILLING.md for the integration checklist."
      />

      <DashboardCard
        eyebrow="Subscription"
        title="Current plan"
        description={
          stripeReady
            ? "Stripe keys detected. Connect Checkout and Customer Portal routes; the subscription id will appear here."
            : "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to activate billing flows."
        }
        footer={
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Status · {snap.status} · tier {snap.tier}
          </p>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-3xl font-medium capitalize tabular-nums text-zinc-50">
              {snap.tier}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {snap.stripeSubscriptionId
                ? `Sub ${snap.stripeSubscriptionId}`
                : "No Stripe subscription id yet — placeholder until Checkout completes."}
            </p>
            {snap.cancelAtPeriodEnd ? (
              <p className="mt-2 text-xs text-amber-200/90">Cancels at period end</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!stripeReady}
              className="h-10 rounded-xl bg-[oklch(0.72_0.14_250)] px-5 text-[oklch(0.12_0.04_265)] hover:bg-[oklch(0.78_0.12_250)] disabled:opacity-50"
            >
              Manage billing
            </Button>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 rounded-xl border-white/[0.1] bg-transparent px-5",
              )}
            >
              Compare plans
            </Link>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        eyebrow="Stripe"
        title="Integration placeholders"
        description="Price IDs from env — see lib/billing/stripe-config.ts"
      >
        <dl className="grid gap-3 font-mono text-[11px] text-zinc-500 sm:grid-cols-2">
          <div>
            <dt>STRIPE_PRICE_PRO_MONTHLY</dt>
            <dd className="mt-1 text-zinc-400">{process.env.STRIPE_PRICE_PRO_MONTHLY ?? "—"}</dd>
          </div>
          <div>
            <dt>STRIPE_PRICE_ELITE_MONTHLY</dt>
            <dd className="mt-1 text-zinc-400">{process.env.STRIPE_PRICE_ELITE_MONTHLY ?? "—"}</dd>
          </div>
        </dl>
      </DashboardCard>

      <DashboardCard eyebrow="Usage" title="Metering" description="Connect usage rows when billing meters go live.">
        <div className="rounded-lg border border-dashed border-white/[0.1] bg-bv-surface-inset/40 px-4 py-8 text-center text-sm text-zinc-500">
          No billable usage yet.
        </div>
      </DashboardCard>
    </div>
  );
}
