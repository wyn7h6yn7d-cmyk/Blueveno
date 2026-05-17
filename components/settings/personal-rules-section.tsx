"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/components/access/access-provider";
import {
  isMissingPersonalRulesTableError,
  PERSONAL_RULES_SETUP_MESSAGE,
} from "@/lib/user-data/personal-rules-schema";
import { cn } from "@/lib/utils";

const RULE_CATEGORIES = ["Risk", "Entry", "Exit", "Session", "Behavior", "Other"] as const;
type RuleCategory = (typeof RULE_CATEGORIES)[number];

type RuleRow = {
  id: string;
  title: string;
  category: RuleCategory;
  is_active: boolean;
  description: string | null;
};

export function PersonalRulesSection() {
  const { canWriteJournal } = useAccess();
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RuleCategory>("Behavior");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  async function loadRules() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("personal_rules")
      .select("id,title,category,is_active,description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      if (isMissingPersonalRulesTableError(error.message, error.code)) {
        setSetupRequired(true);
        setMessage(PERSONAL_RULES_SETUP_MESSAGE);
        setRules([]);
        setLoading(false);
        return;
      }
      setMessage(error.message);
      setLoading(false);
      return;
    }
    setSetupRequired(false);
    let rows = (data ?? []) as RuleRow[];
    if (rows.length === 0) {
      await supabase.rpc("seed_default_personal_rules", { p_user_id: user.id });
      const { data: seeded, error: reloadError } = await supabase
        .from("personal_rules")
        .select("id,title,category,is_active,description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (reloadError) {
        setMessage(reloadError.message);
        setLoading(false);
        return;
      }
      rows = (seeded ?? []) as RuleRow[];
    }
    setRules(rows);
    setLoading(false);
  }

  useEffect(() => {
    void loadRules();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!title.trim()) {
      setMessage("Rule title is required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("personal_rules").insert({
      user_id: user.id,
      title: title.trim(),
      category,
      is_active: true,
      description: description.trim() || null,
    });
    setSaving(false);
    if (error) {
      if (isMissingPersonalRulesTableError(error.message, error.code)) {
        setSetupRequired(true);
        setMessage(PERSONAL_RULES_SETUP_MESSAGE);
      } else {
        setMessage(error.message);
      }
      return;
    }
    setTitle("");
    setDescription("");
    await loadRules();
  }

  async function toggleRule(id: string, current: boolean) {
    if (!canWriteJournal) return;
    const supabase = createClient();
    const { error } = await supabase.from("personal_rules").update({ is_active: !current }).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !current } : r)));
  }

  async function deleteRule(id: string) {
    if (!canWriteJournal) return;
    const supabase = createClient();
    const { error } = await supabase.from("personal_rules").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <DashboardCard eyebrow="Rules" title="Personal trading rules" description="Active rules appear in your journal checklist and stats.">
      {loading ? (
        <p className="text-[14px] text-zinc-500">Loading rules…</p>
      ) : (
        <div className="space-y-4">
          <form onSubmit={onCreate} className="grid gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[13px] text-zinc-300">Rule title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Stop after 2 losses" disabled={!canWriteJournal || saving || setupRequired} className="h-10 rounded-xl border-white/[0.12] bg-black/25" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-zinc-300">Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value as RuleCategory)} disabled={!canWriteJournal || saving || setupRequired} className="h-10 w-full rounded-xl border border-white/[0.12] bg-black/25 px-3 text-[14px] text-zinc-100">
                {RULE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-zinc-300">Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Extra context" disabled={!canWriteJournal || saving || setupRequired} className="h-10 rounded-xl border-white/[0.12] bg-black/25" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={!canWriteJournal || saving || setupRequired} className="h-9 rounded-xl px-4">
                {saving ? "Saving…" : "Add rule"}
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-zinc-100">{rule.title}</p>
                  <p className="text-[11px] text-zinc-500">{rule.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleRule(rule.id, rule.is_active)}
                    disabled={!canWriteJournal}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px]",
                      rule.is_active
                        ? "border-emerald-400/35 bg-emerald-500/[0.14] text-emerald-100"
                        : "border-white/[0.12] bg-white/[0.03] text-zinc-400",
                    )}
                  >
                    {rule.is_active ? "Active" : "Inactive"}
                  </button>
                  <button type="button" onClick={() => void deleteRule(rule.id)} disabled={!canWriteJournal} className="text-[11px] text-rose-300 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {message ? (
            <p className={cn("text-[13px] leading-relaxed", setupRequired ? "text-amber-200/90" : "text-zinc-400")}>
              {message}
            </p>
          ) : null}
          {!canWriteJournal ? <p className="text-[12px] text-zinc-500">Read-only access: rules are visible but editing is locked.</p> : null}
        </div>
      )}
    </DashboardCard>
  );
}
