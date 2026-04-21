import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { getStripe } from "@/lib/billing/stripe";
import { loadAccessForUser } from "@/lib/access/load-access";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PREMIUM_LABEL = "Blueveno Premium";

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
        })
      : null;

  const isReadOnly = state === "trial_expired" && !isAdmin;
  const isTrial = state === "trial_active" && !isAdmin;
  const isPremium = state === "premium_active" && !isAdmin;
  const isAdminUser = isAdmin || state === "admin";

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Billing"
        title="Plan"
        description="One membership — full journal, calendar, and stats. No tiers to compare."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-8 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.85)]",
            isReadOnly
              ? "border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.12_0.03_266/0.95),oklch(0.09_0.028_268/0.98))]"
              : "border-[oklch(0.55_0.12_252/0.35)] bg-[linear-gradient(155deg,oklch(0.16_0.045_262/0.96),oklch(0.1_0.035_266/0.97))]",
          )}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[oklch(0.45_0.14_252/0.12)] blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                {PREMIUM_LABEL}
              </span>
              {isTrial ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                  Trial active
                </span>
              ) : null}
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.55_0.12_252/0.35)] bg-white/[0.06] px-3 py-1 text-[11px] text-zinc-200">
                  <Check className="size-3.5 text-emerald-300" strokeWidth={2} />
                  Active
                </span>
              ) : null}
              {isReadOnly ? (
                <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[11px] text-zinc-400">
                  Read-only
                </span>
              ) : null}
            </div>

            <h2 className="font-display mt-6 text-3xl tracking-[-0.03em] text-zinc-50 md:text-4xl">
              €5.99
              <span className="ml-2 text-lg font-normal text-zinc-500">/ month</span>
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-400">
              {isAdminUser ? (
                "Full access is included for your administrator account — no subscription required."
              ) : isReadOnly ? (
                <>
                  Your journal and calendar stay with you. Upgrade anytime to log new trading days and keep building
                  your history.
                  {trialEndLabel ? (
                    <>
                      {" "}
                      Trial ended <span className="text-zinc-300">{trialEndLabel}</span>.
                    </>
                  ) : null}
                </>
              ) : isTrial ? (
                <>
                  Full access during your trial.
                  {trialEndLabel ? (
                    <>
                      {" "}
                      Ends <span className="text-zinc-200">{trialEndLabel}</span>.
                    </>
                  ) : null}
                </>
              ) : isPremium ? (
                stripeConfigured
                  ? "Manage payment details in the customer portal when checkout is connected."
                  : "Your plan is active. Secure checkout will appear here once billing is connected — your access is unchanged."
              ) : (
                "Stay on top of your month with calendar and stats — one simple price."
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {(isReadOnly || isTrial) && !isAdminUser ? (
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-11 rounded-xl bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.68_0.15_252))] px-6 text-[oklch(0.12_0.04_265)] shadow-[0_12px_40px_-12px_oklch(0.45_0.14_252/0.55)] hover:brightness-[1.03]",
                  )}
                >
                  {isReadOnly ? "Upgrade to Premium" : "View plan details"}
                </Link>
              ) : null}
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 rounded-xl border-white/[0.14] bg-white/[0.04] px-5 text-zinc-100 hover:bg-white/[0.08]",
                )}
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Included</p>
          <ul className="space-y-3 text-[13px] text-zinc-400">
            {["Journal with R, notes, TradingView", "Signature calendar & week totals", "Stats — restrained, clear"].map(
              (line) => (
                <li key={line} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400/90" strokeWidth={2} />
                  <span>{line}</span>
                </li>
              ),
            )}
          </ul>
        </aside>
      </div>

      <DashboardCard
        eyebrow="Receipts"
        title="Invoices & payment"
        description="After your first charge, receipts and card updates will show here."
      >
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-black/15 px-6 py-12 text-center">
          <p className="text-[14px] text-zinc-500">
            {stripeConfigured
              ? "No invoices yet — your history will appear after the first payment."
              : "Payment history connects when Stripe checkout is enabled for your workspace."}
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}
