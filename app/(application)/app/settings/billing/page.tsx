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
import { formatEur, PRICING_EUR } from "@/lib/marketing/pricing-copy";

const PREMIUM_LABEL = "Blueveno Premium";

const PREMIUM_INCLUDES = [
  "Journal — day P&L, notes, optional linked chart",
  "Calendar with colour-coded days and week totals",
  "Stats & overview for your trading history",
] as const;

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
        description="Blueveno Premium — full journal, calendar, and stats. One straightforward price."
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
              {formatEur(PRICING_EUR.monthly)}
              <span className="ml-2 text-lg font-normal text-zinc-500">/ month</span>
            </h2>
            <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              {isAdminUser ? (
                <>
                  <p>Administrator access — full product, no subscription.</p>
                  <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">
                    A paid Premium membership includes:
                  </p>
                  <ul className="mt-3 space-y-2.5 text-[14px] text-zinc-400">
                    {PREMIUM_INCLUDES.map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-400/90" strokeWidth={2} />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : isReadOnly ? (
                <>
                  Your data stays with you. Upgrade to log new trading days anytime.
                  {trialEndLabel ? (
                    <>
                      {" "}
                      Trial ended <span className="text-zinc-300">{trialEndLabel}</span>.
                    </>
                  ) : null}
                </>
              ) : isTrial ? (
                <>
                  Full access for the rest of your trial.
                  {trialEndLabel ? (
                    <>
                      {" "}
                      Ends <span className="text-zinc-200">{trialEndLabel}</span>.
                    </>
                  ) : null}
                </>
              ) : isPremium ? (
                stripeConfigured
                  ? "Manage your card and receipts in the customer portal."
                  : "Your subscription is active. Online card management will be available in a future update — your access is unchanged."
              ) : (
                "Journal, calendar, and stats — one membership."
              )}
            </div>

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
            {PREMIUM_INCLUDES.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-400/90" strokeWidth={2} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <DashboardCard
        eyebrow="Receipts"
        title="Payment history"
        description="Receipts and card updates appear here after your first charge."
      >
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-black/15 px-6 py-12 text-center">
          <p className="text-[14px] text-zinc-500">
            {stripeConfigured
              ? "No payments yet — invoices will show up here after you subscribe."
              : "No charges yet. When online checkout goes live, receipts will appear here automatically."}
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}
