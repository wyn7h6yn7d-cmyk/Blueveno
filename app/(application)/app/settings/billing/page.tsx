import { redirect } from "next/navigation";
import { Check, Crown, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import type { AccessState } from "@/lib/access/types";
import { PageHeader } from "@/components/v2/layout";
import { SectionCard } from "@/components/v2/cards";
import { KpiGrid, MetricCard, StatusPill, type StatusPillTone } from "@/components/v2";
import {
  formatEur,
  PRICING_EUR,
  PREMIUM_BENEFITS,
  effectiveMonthlyFromYearlyEur,
  yearlySavingsPercentApprox,
} from "@/lib/marketing/pricing-copy";
import {
  BLUEVENO_SUPPORT_EMAIL,
  formatTrialDaysLabel,
  getTrialDaysRemaining,
} from "@/lib/access/access-messaging";
import { tradingAccountsMaxForAccess } from "@/lib/trading-accounts/entitlements";
import { PremiumRequestLink } from "@/components/analytics/premium-request-link";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";
import { v2InsetCell } from "@/lib/ui/v2-surface";

const SUPPORT_MAILTO = `mailto:${BLUEVENO_SUPPORT_EMAIL}?subject=${encodeURIComponent("Blueveno Support Request")}`;

type AccessTone = "admin" | "premium" | "trial" | "readonly";

function formatTrialEnd(iso: string | null): string | null {
  if (!iso || Number.isNaN(Date.parse(iso))) return null;
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function accessPresentation(
  state: AccessState,
  isAdmin: boolean,
  trialEndsAt: string | null,
): {
  tone: AccessTone;
  pillTone: StatusPillTone;
  label: string;
  headline: string;
  detail: string;
} {
  if (isAdmin || state === "admin") {
    return {
      tone: "admin",
      pillTone: "success",
      label: "Admin access",
      headline: "Full access is active for this account.",
      detail: "No payment is required. Admin access includes journaling, stats, and up to 5 trading accounts.",
    };
  }
  if (state === "premium_active") {
    return {
      tone: "premium",
      pillTone: "active",
      label: "Premium active",
      headline: "Premium is active on your account.",
      detail: "You have full write access, full calendar history, stats, and up to 5 trading accounts.",
    };
  }
  if (state === "trial_active") {
    const daysLabel = formatTrialDaysLabel(getTrialDaysRemaining(trialEndsAt));
    return {
      tone: "trial",
      pillTone: "info",
      label: "Trial active",
      headline: daysLabel ?? "Your free trial is active",
      detail:
        "Log trades, review your week in Calendar, and explore Stats as your journal grows. Trial includes 1 trading account.",
    };
  }
  return {
    tone: "readonly",
    pillTone: "warning",
    label: "Read-only",
    headline: "Trial ended — workspace is read-only.",
    detail:
      "Your journal and calendar history stay visible. Request Premium to journal again, add accounts, and unlock full stats.",
  };
}

function AccessIcon({ tone }: { tone: AccessTone }) {
  const className = "size-5";
  if (tone === "admin") return <ShieldCheck className={className} strokeWidth={2} />;
  if (tone === "premium") return <Crown className={className} strokeWidth={2} />;
  if (tone === "trial") return <Sparkles className={className} strokeWidth={2} />;
  return <Lock className={className} strokeWidth={2} />;
}

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access) {
    redirect("/login");
  }

  const { state, isAdmin, trialEndsAt } = access;
  const presentation = accessPresentation(state, isAdmin, trialEndsAt);
  const trialEndLabel = formatTrialEnd(trialEndsAt);
  const maxAccounts = tradingAccountsMaxForAccess({ isAdmin, state });
  const accountLimitLabel =
    maxAccounts === 1 ? "1 trading account" : `Up to ${maxAccounts} trading accounts`;

  const showRequestPremium = !isAdmin && state !== "admin" && state !== "premium_active";
  const yearlyEffective = effectiveMonthlyFromYearlyEur();
  const yearlySavings = yearlySavingsPercentApprox();

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Billing"
        title="Plan & access"
        description="Your workspace access, account limits, and Premium options."
      />

      <div className="mx-auto max-w-3xl space-y-5">
        <SectionCard variant="featured" eyebrow="Current access" title={presentation.label} description={presentation.detail}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-bv-ice">
              <AccessIcon tone={presentation.tone} />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={presentation.pillTone} dot>
                  {presentation.label}
                </StatusPill>
                {presentation.tone === "trial" ? (
                  <StatusPill tone="info">{PRICING_EUR.trialDays}-day trial</StatusPill>
                ) : null}
                {isAdmin || state === "admin" ? (
                  <StatusPill tone="success">Billing not required</StatusPill>
                ) : null}
              </div>
              <p className="text-[15px] font-medium leading-snug text-zinc-100">{presentation.headline}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Premium access"
          title={
            isAdmin || state === "admin"
              ? "Admin workspace"
              : state === "premium_active"
                ? "Your Premium plan"
                : "Upgrade to Premium"
          }
          description={
            isAdmin || state === "admin"
              ? "Billing does not apply to this account."
              : "Premium is available by request while in-app checkout is being prepared."
          }
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-[13px] text-zinc-500">
                {showRequestPremium
                  ? "Send a short note to enable Premium on your account."
                  : isAdmin || state === "admin"
                    ? "Questions about access or accounts?"
                    : "Need help with billing or your plan?"}
              </p>
              <div className="flex flex-wrap gap-2">
                {showRequestPremium ? (
                  <PremiumRequestLink source="billing_page" className={cn(appPrimaryCta, "h-10 px-5 text-[14px]")}>
                    Request Premium access
                  </PremiumRequestLink>
                ) : null}
                <a
                  href={SUPPORT_MAILTO}
                  className={cn(showRequestPremium ? appSecondaryCta : appPrimaryCta, "h-10 px-5 text-[14px]")}
                >
                  Contact support
                </a>
              </div>
            </div>
          }
        >
          <KpiGrid columns={3}>
            <MetricCard label="Current state" value={presentation.label} tone={presentation.tone === "readonly" ? "caution" : "neutral"} />
            <MetricCard label="Account limit" value={accountLimitLabel} />
            {isAdmin || state === "admin" ? (
              <MetricCard label="Billing" value="Not required" tone="positive" />
            ) : trialEndLabel ? (
              <MetricCard
                label={state === "trial_active" ? "Trial ends" : "Trial ended"}
                value={trialEndLabel}
                tone={state === "trial_expired" ? "caution" : "neutral"}
              />
            ) : (
              <MetricCard label="Trial" value={`${PRICING_EUR.trialDays} days from signup`} />
            )}
          </KpiGrid>

          {!isAdmin && state !== "admin" ? (
            <div className={cn(v2InsetCell, "mt-5 px-4 py-4 sm:px-5")}>
              <p className="text-[12px] font-medium uppercase tracking-wide text-zinc-500">Pricing</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-display text-2xl tabular-nums tracking-[-0.03em] text-zinc-50">
                    {formatEur(PRICING_EUR.monthly)}
                    <span className="ml-1.5 text-[14px] font-normal text-zinc-500">/ month</span>
                  </p>
                  <p className="mt-1 text-[13px] text-zinc-500">Flexible monthly billing</p>
                </div>
                <div className="sm:border-l sm:border-white/[0.08] sm:pl-4">
                  <p className="font-display text-2xl tabular-nums tracking-[-0.03em] text-zinc-50">
                    {formatEur(PRICING_EUR.yearly)}
                    <span className="ml-1.5 text-[14px] font-normal text-zinc-500">/ year</span>
                  </p>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    About {formatEur(yearlyEffective)}/mo · save ~{yearlySavings}% vs monthly
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-[12px] font-medium uppercase tracking-wide text-zinc-500">Premium includes</p>
            <ul className="mt-3 space-y-2.5">
              {PREMIUM_BENEFITS.map((line) => (
                <li key={line} className="flex gap-2.5 text-[14px] text-zinc-300">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400/90" strokeWidth={2.25} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {state === "trial_active" && !isAdmin && trialEndLabel ? (
            <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-zinc-400">
              After <span className="text-zinc-200">{trialEndLabel}</span>, the workspace becomes read-only until Premium
              is enabled. Your data remains visible.
            </p>
          ) : null}

          {state === "trial_expired" && !isAdmin && trialEndLabel ? (
            <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-[13px] leading-relaxed text-amber-100/90">
              Trial ended on <span className="font-medium text-amber-50">{trialEndLabel}</span>. Request Premium to restore
              journaling and add more accounts.
            </p>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
