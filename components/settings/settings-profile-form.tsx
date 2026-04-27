"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, LogOut, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DISPLAY_CURRENCY_CODES,
  displayCurrencyLabel,
  normalizeDisplayCurrency,
} from "@/lib/format-pnl";
import { allTimezoneOptionValues, TIMEZONE_GROUPS } from "@/lib/timezone-options";
import { TradingAccountsSection } from "@/components/settings/trading-accounts-section";

/** Visible control surface — reads as a box on dark cards (border + lift + top edge). */
const field =
  [
    "h-10 w-full min-w-0 rounded-xl border px-3 text-[15px] text-zinc-100",
    "border-[oklch(0.55_0.12_252/0.38)]",
    "bg-[linear-gradient(168deg,oklch(0.17_0.06_262/0.72)_0%,oklch(0.1_0.045_268/0.88)_100%)]",
    "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.1),0_4px_20px_-10px_rgba(0,0,0,0.85)]",
    "placeholder:text-zinc-600",
    "transition-[border-color,box-shadow] duration-200",
    "focus-visible:border-[oklch(0.62_0.14_252/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.1_0.04_268)]",
  ].join(" ");

const selectField = cn(field, "cursor-pointer py-0 pr-9");

export function SettingsProfileForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("EUR");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !user) {
        setLoading(false);
        setMessage("Could not load profile — try signing in again.");
        return;
      }
      setEmail(user.email ?? "");
      setPendingEmail(user.email ?? "");
      const meta = user.user_metadata as {
        full_name?: string;
        name?: string;
        timezone?: string;
        display_currency?: string;
      } | undefined;
      setDisplayName(meta?.full_name ?? meta?.name ?? "");
      setTimezone(meta?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");
      setDisplayCurrency(normalizeDisplayCurrency(meta?.display_currency));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const tz =
      timezone.trim() ||
      (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName.trim(),
        name: displayName.trim(),
        timezone: tz,
        display_currency: normalizeDisplayCurrency(displayCurrency),
      },
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Saved.");
    router.refresh();
  }

  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword.trim()) {
      setAccountMessage("Enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setAccountMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAccountMessage("Passwords do not match.");
      return;
    }
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setAccountBusy(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setAccountMessage("Password updated.");
  }

  async function onUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingEmail.trim()) {
      setAccountMessage("Enter an email.");
      return;
    }
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: pendingEmail.trim() });
    setAccountBusy(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    setAccountMessage("Check your inbox to confirm the new email.");
  }

  const knownTimezones = allTimezoneOptionValues();
  const timezoneSelectValue = knownTimezones.includes(timezone)
    ? timezone
    : timezone.trim()
      ? timezone
      : "__custom__";

  async function signOut(scope: "local" | "others") {
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } =
      scope === "others"
        ? await supabase.auth.signOut({ scope: "others" })
        : await supabase.auth.signOut({ scope: "local" });
    setAccountBusy(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    if (scope === "local") {
      router.push("/");
      router.refresh();
      return;
    }
    setAccountMessage("Signed out from other devices.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Settings"
        title="Account settings"
        description="Profile, preferences, security, and sessions."
        actions={
          <Button
            type="submit"
            form="profile-form"
            className="h-10 rounded-xl bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.67_0.15_252))] px-4 text-[13px] font-semibold text-[oklch(0.1_0.04_265)] shadow-[0_12px_32px_-16px_oklch(0.45_0.14_252/0.58)] hover:brightness-[1.03]"
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <form id="profile-form" onSubmit={onSave}>
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardCard eyebrow="Profile" title="Your profile" description="Your public name and account email.">
          {loading ? (
            <p className="text-[15px] text-zinc-500">Loading profile…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-[13px] text-zinc-300">
                  Display name
                </Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className={field}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email ?? ""}
                  readOnly
                  className={cn(field, "cursor-not-allowed opacity-80")}
                />
              </div>
            </div>
          )}
          </DashboardCard>

          <DashboardCard
            eyebrow="Preferences"
            title="Workspace preferences"
            description="Choose timezone and display currency."
          >
            {loading ? (
              <p className="text-[15px] text-zinc-500">Loading preferences…</p>
            ) : (
              <div className="grid gap-5">
                <div className="space-y-2">
                <Label htmlFor="timezone" className="text-[13px] text-zinc-300">
                  Timezone
                </Label>
                <p className="text-[13px] text-zinc-500">Used for local times across journal, calendar, and stats.</p>
                <select
                  id="timezone"
                  value={timezoneSelectValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__custom__") setTimezone("");
                    else setTimezone(v);
                  }}
                  className={selectField}
                >
                  {TIMEZONE_GROUPS.map((g) => (
                    <optgroup key={g.region} label={g.region}>
                      {g.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {timezone && !knownTimezones.includes(timezone) ? (
                    <option value={timezone}>{timezone} (saved)</option>
                  ) : null}
                  <option value="__custom__">Custom IANA…</option>
                </select>
                {timezoneSelectValue === "__custom__" ? (
                  <Input
                    id="timezone-custom"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. Europe/London"
                    className={field}
                    aria-label="Custom IANA timezone"
                  />
                ) : null}
              </div>
                <div className="space-y-2">
                <Label htmlFor="display-currency" className="text-[13px] text-zinc-300">
                  Display currency
                </Label>
                <p className="text-[13px] text-zinc-500">Applied to P&L formatting in journal, calendar, and stats.</p>
                <select
                  id="display-currency"
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                  className={selectField}
                >
                  {DISPLAY_CURRENCY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code} — {displayCurrencyLabel(code)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            )}
          </DashboardCard>
        </div>
        {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
      </form>

      <TradingAccountsSection />

      <DashboardCard
        eyebrow="Security"
        title="Security"
        description="Update sign-in details and keep your account secure."
      >
        <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={onUpdatePassword} className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Password</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[13px] text-zinc-300">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={field}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[13px] text-zinc-300">
                Confirm password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={field}
                autoComplete="new-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="h-9 rounded-xl border-white/[0.12] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
            disabled={accountBusy}
          >
            Update password
          </Button>
        </form>

          <form onSubmit={onUpdateEmail} className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Email</p>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="pending-email" className="text-[13px] text-zinc-300">
                New email
              </Label>
              <Input
                id="pending-email"
                type="email"
                value={pendingEmail}
                onChange={(e) => setPendingEmail(e.target.value)}
                placeholder="you@example.com"
                className={field}
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="h-9 rounded-xl border-white/[0.12] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
              disabled={accountBusy}
            >
              Update email
            </Button>
            </div>
            <p className="text-[12px] text-zinc-500">We will ask you to confirm the new email from your inbox.</p>
          </form>
        </div>
      </DashboardCard>

      <DashboardCard
        eyebrow="Sessions"
        title="Active sessions"
        description="Manage where your account stays signed in."
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-5 text-[oklch(0.65_0.12_250)]" strokeWidth={1.75} />
              <div>
                <p className="text-[15px] font-medium text-zinc-200">This device</p>
                <p className="text-sm text-zinc-500">Sign out from this browser session.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 rounded-xl border-white/[0.12] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
              disabled={accountBusy}
              onClick={() => signOut("local")}
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 size-5 text-zinc-500" strokeWidth={1.75} />
              <div>
                <p className="text-[15px] font-medium text-zinc-200">Other devices</p>
                <p className="text-sm text-zinc-500">End sessions on other signed-in devices.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 rounded-xl border-white/[0.12] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
              disabled={accountBusy}
              onClick={() => signOut("others")}
            >
              Sign out others
            </Button>
          </div>
        </div>
        {accountMessage ? <p className="mt-4 text-sm text-zinc-400">{accountMessage}</p> : null}
      </DashboardCard>

      <DashboardCard
        eyebrow="Data & privacy"
        title="Data rights"
        description="Access policy information and contact us for export/deletion requests."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.08]"
          >
            View privacy policy
          </Link>
          <a
            href="mailto:hello@blueveno.com?subject=Blueveno%20Data%20Export%20Request"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.08]"
          >
            Request data export
          </a>
          <a
            href="mailto:hello@blueveno.com?subject=Blueveno%20Account%20Deletion%20Request"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/[0.08] px-4 text-[13px] text-rose-200 transition hover:bg-rose-500/[0.14]"
          >
            Request account deletion
          </a>
          <a
            href="mailto:hello@blueveno.com?subject=Blueveno%20Support%20Request"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.08]"
          >
            Contact support
          </a>
        </div>
      </DashboardCard>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <User className="size-5 text-zinc-500" strokeWidth={1.75} />
          <p className="text-sm text-zinc-500">
            Billing settings are available from the Billing section when active.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          <Link href="/privacy" className="transition hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/cookies" className="transition hover:text-zinc-300">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}
