import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStripe } from "@/lib/billing/stripe";
import { loadAccessForUser } from "@/lib/access/load-access";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PREMIUM_LABEL = "Blueveno Premium";
const PRICE = "€5.99 / month";

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access) {
    redirect("/login");
  }

  const stripeConfigured = Boolean(getStripe());
  const { state, isAdmin, trialEndsAt } = access;

  const trialEndLabel =
    trialEndsAt && !Number.isNaN(Date.parse(trialEndsAt))
      ? new Date(trialEndsAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  let planTitle = PREMIUM_LABEL;
  let planDescription = "";
  let subline = "";

  if (isAdmin || state === "admin") {
    planTitle = "Administrator";
    planDescription = "Full product access without billing.";
    subline = "This account is exempt from subscription checks.";
  } else if (state === "premium_active") {
    planTitle = PREMIUM_LABEL;
    planDescription = "Your subscription is active.";
    subline = stripeConfigured
      ? "Manage payment method and invoices in the customer portal when checkout is wired."
      : "Stripe checkout will appear here once connected — your access remains governed by your account state.";
  } else if (state === "trial_active") {
    planTitle = `${PREMIUM_LABEL} — trial`;
    planDescription = "Full access during your trial window.";
    subline = trialEndLabel ? `Trial ends ${trialEndLabel}.` : "Trial in progress.";
  } else {
    planTitle = "Read-only";
    planDescription = "Your journal stays available to view. Upgrade to log new trading days.";
    subline = trialEndLabel ? `Trial ended ${trialEndLabel}.` : "Subscribe to continue journaling.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Plan & billing"
        description="Single plan — Blueveno Premium at €5.99/month. Secure Stripe checkout when connected."
      />

      <DashboardCard eyebrow="Current plan" title={planTitle} description={planDescription}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {!isAdmin && state !== "admin" ? (
              <>
                <p className="font-display text-3xl font-medium tabular-nums text-zinc-50">
                  €5.99
                  <span className="ml-2 text-base font-normal text-zinc-500">/ month</span>
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{subline}</p>
              </>
            ) : (
              <p className="max-w-md text-[15px] leading-relaxed text-zinc-400">{subline}</p>
            )}
            <p className="mt-3 text-[13px] text-zinc-600">{PRICE} · one plan only</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {state === "trial_expired" ? (
              <span className="rounded-xl border border-[oklch(0.55_0.12_252/0.35)] bg-white/[0.04] px-4 py-2 text-[13px] text-zinc-200">
                Upgrade to continue
              </span>
            ) : null}
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-10 rounded-xl bg-[oklch(0.72_0.14_250)] px-5 text-[oklch(0.12_0.04_265)] hover:bg-[oklch(0.78_0.12_250)]",
              )}
            >
              View pricing
            </Link>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        eyebrow="Invoices"
        title="Payment history"
        description="Receipts and payment method updates will appear here after the first successful charge."
      >
        <div className="rounded-xl border border-white/[0.06] bg-bv-surface-inset/50 px-5 py-10 text-center">
          <p className="text-[14px] text-zinc-500">
            {stripeConfigured ? "No invoices yet." : "Stripe customer portal connects here for subscriptions."}
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}
