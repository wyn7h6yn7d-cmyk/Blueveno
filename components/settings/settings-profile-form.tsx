"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
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
import { PersonalRulesSection } from "@/components/settings/personal-rules-section";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { fetchJournalEntriesForExport, fetchOwnedAccounts } from "@/lib/export/user-exports";

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
  const { activeAccountId } = useTradingAccountsWorkspace();
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
  const [exportBusy, setExportBusy] = useState<null | "journal" | "calendar">(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

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

  async function exportJournalCsv() {
    if (exportBusy) return;
    setExportBusy("journal");
    setExportMessage(null);
    try {
      const supabase = createClient();
      const [accounts, rows] = await Promise.all([fetchOwnedAccounts(supabase), fetchJournalEntriesForExport(supabase)]);
      const byAccount = new Map(accounts.map((a) => [a.id, a]));
      const csvRows = rows.map((row) => {
        const account = row.account_id ? byAccount.get(row.account_id) : null;
        return {
          date: row.entry_date ?? "",
          account_name: account?.name ?? "—",
          account_type: account?.account_type ?? "—",
          symbol: row.symbol ?? "",
          pnl: row.pnl ?? "",
          currency: row.currency ?? "",
          mood: row.mood_score ?? "",
          followed_plan: row.followed_plan == null ? "" : row.followed_plan ? "Yes" : "No",
          respected_stop: row.respected_stop == null ? "" : row.respected_stop ? "Yes" : "No",
          no_revenge_trade: row.no_revenge_trade == null ? "" : row.no_revenge_trade ? "Yes" : "No",
          setup_tag: row.setup_tag ?? "",
          mistake_tag: row.mistake_tag ?? "",
          session_tag: row.session_tag ?? "",
          market_condition: row.market_condition ?? "",
          note: row.note ?? "",
          lesson: row.lesson_learned ?? "",
          chart_link: row.chart_link ?? "",
          created_at: row.created_at ?? "",
          updated_at: row.updated_at ?? "",
        };
      });
      const csv = recordsToCsv(
        [
          { key: "date", label: "date" },
          { key: "account_name", label: "account name" },
          { key: "account_type", label: "account type" },
          { key: "symbol", label: "symbol" },
          { key: "pnl", label: "pnl" },
          { key: "currency", label: "currency" },
          { key: "mood", label: "mood" },
          { key: "followed_plan", label: "followed plan" },
          { key: "respected_stop", label: "respected stop" },
          { key: "no_revenge_trade", label: "no revenge trade" },
          { key: "setup_tag", label: "setup tag" },
          { key: "mistake_tag", label: "mistake tag" },
          { key: "session_tag", label: "session tag" },
          { key: "market_condition", label: "market condition" },
          { key: "note", label: "note" },
          { key: "lesson", label: "lesson" },
          { key: "chart_link", label: "chart link" },
          { key: "created_at", label: "created at" },
          { key: "updated_at", label: "updated at" },
        ],
        csvRows,
      );
      triggerCsvDownload(`blueveno-journal-${fileDate()}.csv`, csv);
      setExportMessage(`Journal export ready (${csvRows.length} rows).`);
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExportBusy(null);
    }
  }

  async function exportCalendarSummaryCsv() {
    if (exportBusy) return;
    setExportBusy("calendar");
    setExportMessage(null);
    try {
      const supabase = createClient();
      const [accounts, rows] = await Promise.all([fetchOwnedAccounts(supabase), fetchJournalEntriesForExport(supabase)]);
      const byAccount = new Map(accounts.map((a) => [a.id, a]));
      const dayMap = new Map<string, { date: string; account_name: string; account_type: string; trades: number; net_pnl: number }>();
      for (const row of rows) {
        const date = row.entry_date ?? (row.created_at ? row.created_at.slice(0, 10) : "");
        if (!date) continue;
        const account = row.account_id ? byAccount.get(row.account_id) : null;
        const accountName = account?.name ?? "—";
        const accountType = account?.account_type ?? "—";
        const key = `${date}::${accountName}`;
        const bucket = dayMap.get(key) ?? { date, account_name: accountName, account_type: accountType, trades: 0, net_pnl: 0 };
        bucket.trades += 1;
        bucket.net_pnl += typeof row.pnl === "number" ? row.pnl : 0;
        dayMap.set(key, bucket);
      }
      const csvRows = [...dayMap.values()]
        .sort((a, b) => (a.date === b.date ? a.account_name.localeCompare(b.account_name) : b.date.localeCompare(a.date)))
        .map((row) => ({
          date: row.date,
          account_name: row.account_name,
          account_type: row.account_type,
          trades: row.trades,
          net_pnl: row.net_pnl,
          day_color: row.net_pnl > 0 ? "green" : row.net_pnl < 0 ? "red" : "flat",
        }));
      const csv = recordsToCsv(
        [
          { key: "date", label: "date" },
          { key: "account_name", label: "account name" },
          { key: "account_type", label: "account type" },
          { key: "trades", label: "trades" },
          { key: "net_pnl", label: "net pnl" },
          { key: "day_color", label: "day color" },
        ],
        csvRows,
      );
      triggerCsvDownload(`blueveno-calendar-summary-${fileDate()}.csv`, csv);
      setExportMessage(`Calendar summary export ready (${csvRows.length} rows).`);
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExportBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Settings"
        title="Account settings"
        description="Profile, preferences, security, and sessions."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
        {[
          { href: "#settings-profile", label: "Profile" },
          { href: "/app/settings?section=accounts#accounts", label: "Trading accounts" },
          { href: "#settings-preferences", label: "Preferences" },
          { href: "#settings-security", label: "Security" },
          { href: "#settings-data-privacy", label: "Data & privacy" },
        ].map((item) =>
          item.href.startsWith("/app/") ? (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg border border-white/[0.1] bg-black/20 px-2.5 py-1 text-[12px] text-zinc-300 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg border border-white/[0.1] bg-black/20 px-2.5 py-1 text-[12px] text-zinc-300 hover:text-zinc-100"
            >
              {item.label}
            </a>
          ),
        )}
      </div>

      <form id="profile-form" onSubmit={onSave}>
        <div id="settings-profile">
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
          <div className="mt-4">
            <Button
              type="submit"
              className="h-10 rounded-xl bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.67_0.15_252))] px-4 text-[13px] font-semibold text-[oklch(0.1_0.04_265)] shadow-[0_12px_32px_-16px_oklch(0.45_0.14_252/0.58)] hover:brightness-[1.03]"
              disabled={loading || saving}
            >
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
          </DashboardCard>
        </div>
      </form>

      <TradingAccountsSection />

      <form id="preferences-form" onSubmit={onSave}>
        <div id="settings-preferences">
          <DashboardCard eyebrow="Preferences" title="Workspace preferences" description="Choose timezone and display currency.">
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
            <div className="mt-4">
              <Button
                type="submit"
                className="h-10 rounded-xl bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.67_0.15_252))] px-4 text-[13px] font-semibold text-[oklch(0.1_0.04_265)] shadow-[0_12px_32px_-16px_oklch(0.45_0.14_252/0.58)] hover:brightness-[1.03]"
                disabled={loading || saving}
              >
                {saving ? "Saving…" : "Save preferences"}
              </Button>
            </div>
          </DashboardCard>
        </div>
        {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
      </form>

      <PersonalRulesSection />

      <div id="settings-security">
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
      </div>

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

      <div id="settings-data-privacy">
        <DashboardCard
          eyebrow="Data & privacy"
          title="Data rights"
          description="Export your data, access policy information, and contact us for deletion/support requests."
        >
          <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.08]"
            onClick={exportJournalCsv}
            disabled={Boolean(exportBusy)}
          >
            {exportBusy === "journal" ? "Exporting…" : "Export journal CSV"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.08]"
            onClick={exportCalendarSummaryCsv}
            disabled={Boolean(exportBusy)}
          >
            {exportBusy === "calendar" ? "Exporting…" : "Export calendar summary CSV"}
          </Button>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.08]"
          >
            View privacy policy
          </Link>
          <a
            href="mailto:kennethalto95@gmail.com?subject=Blueveno%20Account%20Deletion%20Request"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/[0.08] px-4 text-[13px] text-rose-200 transition hover:bg-rose-500/[0.14]"
          >
            Request account deletion
          </a>
          <a
            href="mailto:kennethalto95@gmail.com?subject=Blueveno%20Support%20Request"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.08]"
          >
            Contact support
          </a>
        </div>
          {exportMessage ? <p className="mt-3 text-sm text-zinc-400">{exportMessage}</p> : null}
          {activeAccountId ? (
            <p className="mt-1 text-[12px] text-zinc-500">
              Settings exports include all accounts you own. Page-level exports can follow active account scope.
            </p>
          ) : null}
        </DashboardCard>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <User className="size-5 text-zinc-500" strokeWidth={1.75} />
          <p className="text-sm text-zinc-500">
            Plan and access details are available from the Plan & access section.
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
