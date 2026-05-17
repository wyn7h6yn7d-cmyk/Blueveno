import { redirect } from "next/navigation";
import { Check, Crown, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import type { AccessState } from "@/lib/access/types";
import { PageHeader } from "@/components/app/page-header";
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
  label: string;
  headline: string;
  detail: string;
} {
  if (isAdmin || state === "admin") {
    return {
      tone: "admin",
      label: "Admin access",
      headline: "Full access is active for this account.",
      detail: "No payment is required. Admin access includes journaling, stats, and up to 5 trading accounts.",
    };
  }
  if (state === "premium_active") {
    return {
      tone: "premium",
      label: "Premium active",
      headline: "Premium is active on your account.",
      detail: "You have full write access, full calendar history, stats, and up to 5 trading accounts.",
    };
  }
  if (state === "trial_active") {
    const daysLabel = formatTrialDaysLabel(getTrialDaysRemaining(trialEndsAt));
    return {
      tone: "trial",
      label: "Trial active",
      headline: daysLabel ?? "Your free trial is active",
      detail:
        "Log trades, review your week in Calendar, and explore Stats as your journal grows. Trial includes 1 trading account.",
    };
  }
  return {
    tone: "readonly",
    label: "Read-only",
    headline: "Trial ended — workspace is read-only.",
    detail:
      "Your journal and calendar history stay visible. Request Premium to journal again, add accounts, and unlock full stats.",
  };
}

const toneBannerClass: Record<AccessTone, string> = {
  admin:
    "border-emerald-400/30 bg-[linear-gradient(155deg,oklch(0.2_0.06_155/0.35),oklch(0.11_0.04_160/0.5))] shadow-[inset_0_1px_0_0_oklch(0.9_0.08_155/0.2),0_24px_64px_-40px_oklch(0.45_0.14_155/0.35)]",
  premium:
    "border-[oklch(0.55_0.12_252/0.38)] bg-[linear-gradient(155deg,oklch(0.2_0.05_258/0.55),oklch(0.11_0.035_266/0.6))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.1),0_28px_72px_-44px_oklch(0.48_0.14_252/0.45)]",
  trial:
    "border-emerald-400/28 bg-[linear-gradient(155deg,oklch(0.18_0.05_155/0.4),oklch(0.11_0.035_266/0.55))] shadow-[inset_0_1px_0_0_oklch(0.88_0.07_155/0.16),0_24px_64px_-42px_oklch(0.42_0.12_155/0.3)]",
  readonly:
    "border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.12_0.03_266/0.95),oklch(0.09_0.028_268/0.98))] shadow-[0_24px_64px_-48px_rgba(0,0,0,0.85)]",
};

const toneIconClass: Record<AccessTone, string> = {
  admin: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
  premium: "border-[oklch(0.55_0.12_252/0.4)] bg-[oklch(0.58_0.12_252/0.14)] text-[oklch(0.88_0.1_252)]",
  trial: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
  readonly: "border-white/[0.12] bg-white/[0.05] text-zinc-400",
};

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
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Billing"
        title="Plan & access"
        description="Your workspace access, account limits, and Premium options."
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border px-5 py-5 sm:px-7 sm:py-6",
            toneBannerClass[presentation.tone],
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                toneIconClass[presentation.tone],
              )}
            >
              <AccessIcon tone={presentation.tone} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="app-metric-label">Current access</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-zinc-50 sm:text-2xl">
                  {presentation.label}
                </h2>
                {presentation.tone === "trial" ? (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100">
                    {PRICING_EUR.trialDays}-day trial
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[15px] font-medium leading-snug text-zinc-100">{presentation.headline}</p>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-zinc-400">{presentation.detail}</p>
            </div>
          </div>
        </div>

        <section
          className={cn(
            "overflow-hidden rounded-2xl border border-[oklch(0.55_0.12_252/0.32)]",
            "bg-[linear-gradient(158deg,oklch(0.17_0.046_258/0.97),oklch(0.1_0.034_266/0.98))]",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.09),0_32px_80px_-48px_oklch(0.48_0.14_252/0.42)] ring-1 ring-[oklch(0.58_0.1_252/0.16)]",
          )}
        >
          <header className="border-b border-white/[0.08] px-5 py-5 sm:px-7">
            <p className="text-[12px] font-medium tracking-wide text-[oklch(0.72_0.1_252)]">Premium access</p>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] text-zinc-50">
              {isAdmin || state === "admin"
                ? "Admin workspace"
                : state === "premium_active"
                  ? "Your Premium plan"
                  : "Upgrade to Premium"}
            </h3>
            <p className="mt-1.5 text-[14px] text-zinc-400">
              {isAdmin || state === "admin"
                ? "Billing does not apply to this account."
                : "Premium is available by request while in-app checkout is being prepared."}
            </p>
          </header>

          <div className="space-y-6 px-5 py-6 sm:px-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricTile label="Current state" value={presentation.label} emphasize />
              <MetricTile label="Account limit" value={accountLimitLabel} />
              {isAdmin || state === "admin" ? (
                <MetricTile label="Billing" value="Not required" />
              ) : trialEndLabel ? (
                <MetricTile
                  label={state === "trial_active" ? "Trial ends" : "Trial ended"}
                  value={trialEndLabel}
                />
              ) : (
                <MetricTile label="Trial" value={`${PRICING_EUR.trialDays} days from signup`} />
              )}
            </div>

            {!isAdmin && state !== "admin" ? (
              <div className="rounded-xl border border-white/[0.1] bg-black/20 px-4 py-4 sm:px-5">
                <p className="app-metric-label">Pricing</p>
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

            <div>
              <p className="app-metric-label">Premium includes</p>
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
              <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-zinc-400">
                After <span className="text-zinc-200">{trialEndLabel}</span>, the workspace becomes read-only until
                Premium is enabled. Your data remains visible.
              </p>
            ) : null}

            {state === "trial_expired" && !isAdmin && trialEndLabel ? (
              <p className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-[13px] leading-relaxed text-amber-100/90">
                Trial ended on <span className="font-medium text-amber-50">{trialEndLabel}</span>. Request Premium to
                restore journaling and add more accounts.
              </p>
            ) : null}
          </div>

          <footer className="flex flex-col gap-3 border-t border-white/[0.08] bg-black/20 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-7">
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
                className={cn(
                  showRequestPremium ? appSecondaryCta : appPrimaryCta,
                  "h-10 px-5 text-[14px]",
                )}
              >
                Contact support
              </a>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  sub,
  emphasize,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5">
      <p className="app-metric-label">{label}</p>
      <p
        className={cn(
          "mt-1.5 tabular-nums text-zinc-100",
          emphasize ? "font-display text-[17px] font-semibold tracking-[-0.02em]" : "text-[14px]",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{sub}</p> : null}
    </div>
  );
}
