"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { cn } from "@/lib/utils";
import { TRADING_ACCOUNT_TYPES, type TradingAccountType } from "@/lib/trading-accounts/types";
import { useAccess } from "@/components/access/access-provider";
import {
  canManageTradingAccounts,
  tradingAccountsMaxForAccess,
  tradingAccountsUsageText,
} from "@/lib/trading-accounts/entitlements";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";

const field =
  "h-10 w-full min-w-0 rounded-xl border border-white/[0.12] bg-black/25 px-3 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";

type FormState = {
  name: string;
  accountType: TradingAccountType | "";
  currency: string;
  brokerPlatform: string;
  startingBalance: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  accountType: "",
  currency: "EUR",
  brokerPlatform: "",
  startingBalance: "",
  notes: "",
};
export function TradingAccountsSection() {
  const access = useAccess();
  const { isReadOnlyTrial } = access;
  const searchParams = useSearchParams();
  const {
    userId,
    accounts,
    activeAccountId,
    loading,
    error: accountsLoadError,
    reload,
    setActiveAccount,
  } = useTradingAccountsWorkspace();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const focusCreate = searchParams.get("new") === "1";
  const sectionParam = searchParams.get("section");
  const shouldShow = sectionParam === null || sectionParam === "accounts";
  const canManage = canManageTradingAccounts(access);
  const maxAccounts = tradingAccountsMaxForAccess(access);
  const atAccountLimit = accounts.length >= maxAccounts;

  useEffect(() => {
    if (!focusCreate) return;
    const el = document.getElementById("accounts-create-name");
    el?.focus();
  }, [focusCreate, shouldShow]);

  async function handleSetMainAccount(id: string) {
    if (!userId) return;
    const result = await setActiveAccount(id);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage("Main account updated.");
  }

  async function onSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !canManage) return;
    if (!editingId && atAccountLimit) {
      setMessage(maxAccounts === 1 ? "Upgrade to Premium to add more accounts." : "You've reached the 5-account limit.");
      return;
    }
    if (!form.name.trim()) {
      setMessage("Account name is required.");
      return;
    }
    if (!form.accountType) {
      setMessage("Account type is required.");
      return;
    }
    if (!form.currency.trim()) {
      setMessage("Currency is required.");
      return;
    }
    if (form.startingBalance.trim() && Number.isNaN(Number(form.startingBalance.trim()))) {
      setMessage("Starting balance must be numeric.");
      return;
    }

    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const payload = {
      user_id: userId,
      name: form.name.trim(),
      account_type: form.accountType,
      currency: form.currency.trim().toUpperCase(),
      broker_platform: form.brokerPlatform.trim() || null,
      starting_balance: form.startingBalance.trim() ? Number(form.startingBalance.trim()) : null,
      notes: form.notes.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase.from("trading_accounts").update(payload).eq("id", editingId).eq("user_id", userId);
      if (error) {
        setSaving(false);
        setMessage(error.message);
        return;
      }
      setMessage("Account updated.");
    } else {
      const { data, error } = await supabase.from("trading_accounts").insert(payload).select("id").single();
      if (error) {
        setSaving(false);
        setMessage(error.message);
        return;
      }
      const newId = (data?.id as string | undefined) ?? null;
      if (newId && (!activeAccountId || accounts.length === 0)) {
        await setActiveAccount(newId);
      }
      setMessage("Account created.");
    }

    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaving(false);
    await reload();
  }

  async function onDeleteAccount() {
    if (!userId || !deleteId || !canManage) return;
    setDeleting(true);
    setMessage(null);
    const supabase = createClient();
    const { error: journalDeleteError } = await supabase
      .from("journal_entries")
      .delete()
      .eq("user_id", userId)
      .eq("account_id", deleteId);
    if (journalDeleteError) {
      setDeleting(false);
      setMessage(journalDeleteError.message);
      return;
    }
    const { error } = await supabase.from("trading_accounts").delete().eq("id", deleteId).eq("user_id", userId);
    if (error) {
      setDeleting(false);
      setMessage(error.message);
      return;
    }
    const remaining = accounts.filter((a) => a.id !== deleteId);
    if (activeAccountId === deleteId) {
      const fallback = remaining[0]?.id ?? null;
      if (fallback) {
        await setActiveAccount(fallback);
      } else {
        const { error: clearActiveError } = await supabase
          .from("user_profiles")
          .update({ active_trading_account_id: null, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
        if (clearActiveError) {
          setDeleting(false);
          setMessage(clearActiveError.message);
          return;
        }
      }
    }
    setDeleting(false);
    setDeleteId(null);
    setMessage("Account deleted.");
    await reload();
  }

  if (!shouldShow) return null;

  return (
    <div id="accounts">
      <DashboardCard
        eyebrow="Trading accounts"
        title="Trading accounts"
        description="Create, edit, delete, and switch your main trading account."
      >
      {loading ? <p className="text-[14px] text-zinc-500">Loading trading accounts…</p> : null}

      {!loading && accountsLoadError ? (
        <p className="text-[14px] text-rose-300/95" role="alert">
          {accountsLoadError}
        </p>
      ) : null}

      {!loading ? (
        <div className="space-y-5">
          <form onSubmit={onSaveAccount} className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {editingId ? "Edit account" : "Create account"}
            </p>
            <p className="text-[12px] text-zinc-500">{tradingAccountsUsageText(accounts.length, maxAccounts)}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="accounts-create-name">Account name</Label>
                <Input
                  id="accounts-create-name"
                  className={field}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!canManage || saving}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input
                  className={field}
                  value={form.currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                  disabled={!canManage || saving}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Account type</Label>
                <select
                  className={cn(field, "pr-9")}
                  value={form.accountType}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountType: e.target.value as TradingAccountType }))}
                  disabled={!canManage || saving}
                  required
                >
                  <option value="">Select type</option>
                  {TRADING_ACCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Broker / firm</Label>
                <Input
                  className={field}
                  value={form.brokerPlatform}
                  onChange={(e) => setForm((prev) => ({ ...prev, brokerPlatform: e.target.value }))}
                  disabled={!canManage || saving}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Starting balance</Label>
                <Input
                  className={field}
                  value={form.startingBalance}
                  onChange={(e) => setForm((prev) => ({ ...prev, startingBalance: e.target.value }))}
                  disabled={!canManage || saving}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea
                className="w-full resize-none rounded-xl border border-white/[0.12] bg-black/25 px-3 py-2.5 text-[14px] text-zinc-100"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                disabled={!canManage || saving}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={!canManage || saving || (!editingId && atAccountLimit)}
                className="h-9 rounded-xl px-3.5"
              >
                <Plus className="mr-1.5 size-4" />
                {editingId ? "Save account" : "Create account"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-white/[0.12] bg-white/[0.03] text-zinc-200"
                  onClick={() => setEditingId(null)}
                  disabled={saving}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
            {!canManage ? (
              <p className="text-[12px] text-zinc-500">
                {isReadOnlyTrial ? "Read-only access after trial. Keep your history visible." : "Account management is disabled."}{" "}
                <Link href="/app/settings/billing" className="text-[oklch(0.78_0.11_252)] underline-offset-4 hover:underline">
                  Upgrade to keep journaling and manage accounts
                </Link>
                .
              </p>
            ) : null}
            {canManage && atAccountLimit && !editingId ? (
              <p className="text-[12px] text-zinc-500">
                {maxAccounts === 1
                  ? "Upgrade to Premium to add more accounts."
                  : "You've reached the 5-account limit."}
              </p>
            ) : null}
          </form>

          {accounts.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-zinc-500">
              <p>No trading accounts yet. Add one account to start journaling.</p>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("accounts-create-name");
                    if (el instanceof HTMLElement) el.focus();
                  }}
                  className="mt-3 inline-flex text-[12px] text-[oklch(0.78_0.11_252)] hover:underline"
                >
                  Create your first account
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2.5">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={cn(
                    "rounded-xl border p-3.5",
                    activeAccountId === account.id
                      ? "border-[oklch(0.58_0.11_252/0.36)] bg-[linear-gradient(160deg,oklch(0.18_0.05_262/0.6),oklch(0.1_0.04_266/0.55))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08)]"
                      : "border-white/[0.08] bg-black/20",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-zinc-100">{account.name}</p>
                      <p className="mt-0.5 text-[12px] text-zinc-500">
                        {account.accountType} · {account.currency}
                        {account.brokerPlatform ? ` · ${account.brokerPlatform}` : ""}
                        {account.startingBalance != null ? ` · ${account.startingBalance}` : ""}
                      </p>
                    </div>
                    {activeAccountId === account.id ? (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
                        Main
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200"
                      onClick={() => void handleSetMainAccount(account.id)}
                      disabled={activeAccountId === account.id}
                    >
                      Set as main
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200 disabled:opacity-55"
                      onClick={() => {
                        setEditingId(account.id);
                        setForm({
                          name: account.name,
                          accountType: account.accountType,
                          currency: account.currency,
                          brokerPlatform: account.brokerPlatform ?? "",
                          startingBalance: account.startingBalance != null ? String(account.startingBalance) : "",
                          notes: account.notes ?? "",
                        });
                      }}
                      disabled={!canManage}
                    >
                      <Pencil className="mr-1 size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg border-rose-400/35 bg-rose-500/[0.09] px-3 text-[12px] text-rose-200 disabled:opacity-55"
                      onClick={() => setDeleteId(account.id)}
                      disabled={!canManage}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {message ? <p className="mt-4 text-[13px] text-zinc-400">{message}</p> : null}
      {!canManage && !loading ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-zinc-500">
          <Lock className="size-3.5" />
          You can switch accounts, but create/edit/delete are locked in read-only access after trial.
        </p>
      ) : null}

        <ConfirmDialog
          open={Boolean(deleteId)}
          onCancel={() => {
            if (deleting) return;
            setDeleteId(null);
          }}
          onConfirm={() => void onDeleteAccount()}
          destructive
          pending={deleting}
          title="Delete trading account?"
          description="This cannot be undone. All journal entries linked to this account will be deleted."
          confirmLabel="Delete account"
        />
      </DashboardCard>
    </div>
  );
}
