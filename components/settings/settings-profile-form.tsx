"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { PageHeader } from "@/components/app/page-header";
import {
  Database,
  Landmark,
  ListChecks,
  Lock,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { SectionNav, type SectionNavItem } from "@/components/app/section-nav";
import { cn } from "@/lib/utils";
import { normalizeDisplayCurrency } from "@/lib/format-pnl";
import { allTimezoneOptionValues } from "@/lib/timezone-options";
import { SettingsPanels } from "@/components/settings/settings-panels";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { fetchJournalEntriesForExport, fetchOwnedAccounts } from "@/lib/export/user-exports";
import {
  parseSettingsSection,
  settingsSectionDescription,
  type SettingsSectionId,
} from "@/lib/settings/sections";
import { appFormFieldLifted } from "@/lib/ui/app-form";
import { useAppToast } from "@/components/app/app-toast-provider";
import { formatUserError } from "@/lib/feedback/format-error";
import { trackExportCsvClicked } from "@/lib/analytics/track-product-event";

const SETTINGS_NAV_ITEMS: SectionNavItem[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "accounts", label: "Trading accounts", icon: Landmark },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "rules", label: "Rules", icon: ListChecks },
  { id: "security", label: "Security", icon: Lock },
  { id: "data", label: "Data & privacy", icon: Database },
];

const field = appFormFieldLifted;
const selectField = cn(field, "cursor-pointer py-0 pr-9");

export function SettingsProfileForm() {
  const toast = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = parseSettingsSection(searchParams.get("section"));
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
  const [saveFeedback, setSaveFeedback] = useState<{ section: "profile" | "preferences"; message: string } | null>(null);
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
        setSaveFeedback({ section: "profile", message: "Could not load profile — try signing in again." });
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

  function navigateSection(next: SettingsSectionId) {
    setSaveFeedback(null);
    setAccountMessage(null);
    setExportMessage(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    if (next !== "accounts") params.delete("new");
    const query = params.toString();
    router.replace(query ? `/app/settings?${query}` : "/app/settings", { scroll: false });
  }

  async function onSave(e: React.FormEvent, source: "profile" | "preferences") {
    e.preventDefault();
    setSaving(true);
    setSaveFeedback(null);
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
      const msg = formatUserError(error, source === "profile" ? "Could not save profile." : "Could not save preferences.");
      setSaveFeedback({ section: source, message: msg });
      toast.error(msg);
      return;
    }
    const ok = source === "profile" ? "Profile saved." : "Preferences saved.";
    setSaveFeedback({ section: source, message: ok });
    toast.success(ok);
    router.refresh();
  }

  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword.trim()) {
      const msg = "Enter a new password.";
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = "Password must be at least 8 characters.";
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match.";
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setAccountBusy(false);
    if (error) {
      const msg = formatUserError(error, "Could not update password.");
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setAccountMessage("Password updated.");
    toast.success("Password updated.");
  }

  async function onUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingEmail.trim()) {
      const msg = "Enter an email.";
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: pendingEmail.trim() });
    setAccountBusy(false);
    if (error) {
      const msg = formatUserError(error, "Could not update email.");
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    const ok = "Check your inbox to confirm the new email.";
    setAccountMessage(ok);
    toast.info(ok);
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
      const msg = formatUserError(error, "Could not sign out.");
      setAccountMessage(msg);
      toast.error(msg);
      return;
    }
    if (scope === "local") {
      router.push("/");
      router.refresh();
      return;
    }
    const ok = "Signed out from other devices.";
    setAccountMessage(ok);
    toast.success(ok);
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
          currency: account?.currency ?? "",
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
      trackExportCsvClicked("journal", "settings");
      triggerCsvDownload(`blueveno-journal-${fileDate()}.csv`, csv);
      const ok = `Journal CSV ready (${csvRows.length} rows).`;
      setExportMessage(ok);
      toast.success(ok);
    } catch (error) {
      const msg = formatUserError(error, "Could not export journal CSV.");
      setExportMessage(msg);
      toast.error(msg);
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
      trackExportCsvClicked("calendar_summary", "settings");
      triggerCsvDownload(`blueveno-calendar-summary-${fileDate()}.csv`, csv);
      const ok = `Calendar summary CSV ready (${csvRows.length} rows).`;
      setExportMessage(ok);
      toast.success(ok);
    } catch (error) {
      const msg = formatUserError(error, "Could not export calendar summary.");
      setExportMessage(msg);
      toast.error(msg);
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
        description={settingsSectionDescription(section)}
      />

      <SectionNav
        items={SETTINGS_NAV_ITEMS}
        activeId={section}
        onChange={(id) => navigateSection(id as SettingsSectionId)}
        ariaLabel="Settings sections"
        variant="compact"
        className="app-scroll-tabs-x w-full"
      />

      <SettingsPanels
        section={section}
        field={field}
        selectField={selectField}
        loading={loading}
        saving={saving}
        saveFeedback={saveFeedback}
        onSave={onSave}
        displayName={displayName}
        setDisplayName={setDisplayName}
        email={email}
        timezoneSelectValue={timezoneSelectValue}
        timezone={timezone}
        setTimezone={setTimezone}
        knownTimezones={knownTimezones}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        pendingEmail={pendingEmail}
        setPendingEmail={setPendingEmail}
        accountBusy={accountBusy}
        accountMessage={accountMessage}
        onUpdatePassword={onUpdatePassword}
        onUpdateEmail={onUpdateEmail}
        signOut={signOut}
        exportBusy={exportBusy}
        exportMessage={exportMessage}
        exportJournalCsv={exportJournalCsv}
        exportCalendarSummaryCsv={exportCalendarSummaryCsv}
        activeAccountId={activeAccountId}
      />

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <User className="size-5 text-zinc-500" strokeWidth={1.75} />
          <p className="text-sm text-zinc-500">
            Plan and access details are available from the{" "}
            <Link href="/app/settings/billing" className="text-[oklch(0.78_0.11_252)] hover:underline">
              Plan &amp; access
            </Link>{" "}
            section.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 app-metric-label">
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
