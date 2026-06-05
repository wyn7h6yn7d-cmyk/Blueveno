"use client";

import Link from "next/link";
import { KeyRound, LogOut, Shield } from "lucide-react";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { SectionCard } from "@/components/v2/cards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DISPLAY_CURRENCY_CODES,
  displayCurrencyLabel,
} from "@/lib/format-pnl";
import { TIMEZONE_GROUPS } from "@/lib/timezone-options";
import { TradingAccountsSection } from "@/components/settings/trading-accounts-section";
import { PersonalRulesSection } from "@/components/settings/personal-rules-section";
import type { SettingsSectionId } from "@/lib/settings/sections";
import { DELETION_REQUEST_MAILTO, SUPPORT_REQUEST_MAILTO } from "@/lib/legal/constants";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { v2InsetCell } from "@/lib/ui/v2-surface";

type SaveFeedback = { section: "profile" | "preferences"; message: string } | null;

export type SettingsPanelsProps = {
  section: SettingsSectionId;
  field: string;
  selectField: string;
  loading: boolean;
  saving: boolean;
  saveFeedback: SaveFeedback;
  onSave: (e: React.FormEvent, source: "profile" | "preferences") => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  email: string | null;
  timezoneSelectValue: string;
  timezone: string;
  setTimezone: (value: string) => void;
  knownTimezones: string[];
  displayCurrency: string;
  setDisplayCurrency: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  pendingEmail: string;
  setPendingEmail: (value: string) => void;
  accountBusy: boolean;
  accountMessage: string | null;
  onUpdatePassword: (e: React.FormEvent) => void;
  onUpdateEmail: (e: React.FormEvent) => void;
  signOut: (scope: "local" | "others") => void;
  exportBusy: null | "journal" | "calendar";
  exportMessage: string | null;
  exportJournalCsv: () => void;
  exportCalendarSummaryCsv: () => void;
  activeAccountId: string | null;
};

export function SettingsPanels({
  section,
  field,
  selectField,
  loading,
  saving,
  saveFeedback,
  onSave,
  displayName,
  setDisplayName,
  email,
  timezoneSelectValue,
  timezone,
  setTimezone,
  knownTimezones,
  displayCurrency,
  setDisplayCurrency,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  pendingEmail,
  setPendingEmail,
  accountBusy,
  accountMessage,
  onUpdatePassword,
  onUpdateEmail,
  signOut,
  exportBusy,
  exportMessage,
  exportJournalCsv,
  exportCalendarSummaryCsv,
  activeAccountId,
}: SettingsPanelsProps) {
  if (section === "profile") {
    return (
      <form id="profile-form" onSubmit={(e) => void onSave(e, "profile")}>
        <div id="settings-profile">
          <SectionCard eyebrow="Profile" title="Your profile" description="Your public name and account email.">
            {loading ? (
              <p className="text-[14px] text-zinc-500">Loading profile…</p>
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
                  <Input id="email" value={email ?? ""} readOnly className={cn(field, "cursor-not-allowed opacity-80")} />
                </div>
              </div>
            )}
            <div className="mt-4">
              <Button type="submit" className={appPrimaryCta} disabled={loading || saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </div>
            {saveFeedback?.section === "profile" ? (
              <div className="mt-4">
                <InlineFeedback message={saveFeedback.message} tone={feedbackToneFromMessage(saveFeedback.message)} />
              </div>
            ) : null}
          </SectionCard>
        </div>
      </form>
    );
  }

  if (section === "accounts") {
    return <TradingAccountsSection />;
  }

  if (section === "preferences") {
    return (
      <form id="preferences-form" onSubmit={(e) => void onSave(e, "preferences")}>
        <div id="settings-preferences">
          <SectionCard eyebrow="Preferences" title="Workspace preferences" description="Choose timezone and display currency.">
            {loading ? (
              <p className="text-[14px] text-zinc-500">Loading preferences…</p>
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
              <Button type="submit" className={appPrimaryCta} disabled={loading || saving}>
                {saving ? "Saving…" : "Save preferences"}
              </Button>
            </div>
            {saveFeedback?.section === "preferences" ? (
              <div className="mt-4">
                <InlineFeedback message={saveFeedback.message} tone={feedbackToneFromMessage(saveFeedback.message)} />
              </div>
            ) : null}
          </SectionCard>
        </div>
      </form>
    );
  }

  if (section === "rules") {
    return <PersonalRulesSection />;
  }

  if (section === "security") {
    return (
      <div id="settings-security" className="space-y-5">
        <SectionCard eyebrow="Security" title="Sign-in details" description="Update password and email for this workspace.">
          <div className="grid gap-6 xl:grid-cols-2">
            <form onSubmit={onUpdatePassword} className="space-y-4">
              <p className="text-[12px] font-medium uppercase tracking-wide text-zinc-500">Password</p>
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
              <Button type="submit" variant="outline" className={appSecondaryCta} disabled={accountBusy}>
                Update password
              </Button>
            </form>

            <form onSubmit={onUpdateEmail} className="space-y-4">
              <p className="text-[12px] font-medium uppercase tracking-wide text-zinc-500">Email</p>
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
                <Button type="submit" variant="outline" className={appSecondaryCta} disabled={accountBusy}>
                  Update email
                </Button>
              </div>
              <p className="text-[12px] text-zinc-500">We will ask you to confirm the new email from your inbox.</p>
            </form>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Sessions" title="Active sessions" description="Manage where your account stays signed in.">
          <div className="grid gap-3">
            <div className={cn(v2InsetCell, "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between")}>
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 size-5 text-bv-ice" strokeWidth={1.75} />
                <div>
                  <p className="text-[14px] font-medium text-zinc-200">This device</p>
                  <p className="text-[13px] text-zinc-500">Sign out from this browser session.</p>
                </div>
              </div>
              <Button type="button" variant="outline" className={appSecondaryCta} disabled={accountBusy} onClick={() => signOut("local")}>
                <LogOut className="mr-2 size-4" />
                Sign out
              </Button>
            </div>
            <div className={cn(v2InsetCell, "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between")}>
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 size-5 text-zinc-500" strokeWidth={1.75} />
                <div>
                  <p className="text-[14px] font-medium text-zinc-200">Other devices</p>
                  <p className="text-[13px] text-zinc-500">End sessions on other signed-in devices.</p>
                </div>
              </div>
              <Button type="button" variant="outline" className={appSecondaryCta} disabled={accountBusy} onClick={() => signOut("others")}>
                Sign out others
              </Button>
            </div>
          </div>
          {accountMessage ? (
            <div className="mt-4">
              <InlineFeedback message={accountMessage} tone={feedbackToneFromMessage(accountMessage)} />
            </div>
          ) : null}
        </SectionCard>
      </div>
    );
  }

  if (section === "data") {
    return (
      <div id="settings-data-privacy">
        <SectionCard
          eyebrow="Data & privacy"
          title="Data rights"
          description="Export your data, access policy information, and contact us for deletion or support."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" className={cn(appSecondaryCta, "min-h-11 w-full")} onClick={exportJournalCsv} disabled={Boolean(exportBusy)}>
              {exportBusy === "journal" ? "Exporting…" : "Export journal CSV"}
            </Button>
            <Button type="button" variant="outline" className={cn(appSecondaryCta, "min-h-11 w-full")} onClick={exportCalendarSummaryCsv} disabled={Boolean(exportBusy)}>
              {exportBusy === "calendar" ? "Exporting…" : "Export calendar summary CSV"}
            </Button>
            <Link href="/privacy" className={cn(appSecondaryCta, "min-h-11 w-full")}>
              View privacy policy
            </Link>
            <Link href="/terms" className={cn(appSecondaryCta, "min-h-11 w-full")}>
              Terms of Service
            </Link>
            <Link href="/cookies" className={cn(appSecondaryCta, "min-h-11 w-full")}>
              Cookie Policy
            </Link>
            <a
              href={DELETION_REQUEST_MAILTO}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/[0.08] px-4 text-[13px] text-rose-200 transition hover:bg-rose-500/[0.14]"
            >
              Request account deletion
            </a>
            <a href={SUPPORT_REQUEST_MAILTO} className={cn(appSecondaryCta, "min-h-11 w-full sm:col-span-2")}>
              Contact support
            </a>
          </div>
          {exportMessage ? (
            <div className="mt-3">
              <InlineFeedback message={exportMessage} tone={feedbackToneFromMessage(exportMessage)} />
            </div>
          ) : null}
          {activeAccountId ? (
            <p className="mt-2 text-[12px] text-zinc-500">
              Settings exports include all accounts you own. Page-level exports can follow active account scope.
            </p>
          ) : null}
        </SectionCard>
      </div>
    );
  }

  return null;
}
