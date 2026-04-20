"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Filter } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";

type Props = {
  userId: string;
};

function downloadCsv(rows: { time: string; sym: string; setup: string; r: string; tag: string; note?: string }[]) {
  const header = ["time", "symbol", "setup", "r", "tag", "note"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [row.time, row.sym, `"${row.setup.replace(/"/g, '""')}"`, row.r, row.tag, `"${(row.note ?? "").replace(/"/g, '""')}"`].join(
        ",",
      ),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blueveno-journal-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function JournalPageClient({ userId }: Props) {
  const { data, ready, addRow } = useUserWorkspace(userId);
  const [time, setTime] = useState("");
  const [sym, setSym] = useState("");
  const [setup, setSetup] = useState("");
  const [r, setR] = useState("");
  const [tag, setTag] = useState("");
  const [note, setNote] = useState("");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sym.trim() || !r.trim()) return;
    const t = time.trim() || new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    addRow({
      time: t,
      sym: sym.trim().toUpperCase(),
      setup: setup.trim() || "—",
      r: r.trim(),
      tag: tag.trim() || "Manual",
      note: note.trim() || undefined,
    });
    setSym("");
    setSetup("");
    setR("");
    setTag("");
    setNote("");
    setTime("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Journal"
        title="Trade stream"
        description="Log fills here during the test period — data is stored per account in this browser."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-2 rounded-xl border-white/[0.1] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
              disabled
            >
              <Filter className="size-4" strokeWidth={1.75} />
              Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-2 rounded-xl border-white/[0.1] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
              onClick={() => downloadCsv(data.journal)}
              disabled={!data.journal.length}
            >
              <Download className="size-4" strokeWidth={1.75} />
              Export CSV
            </Button>
          </>
        }
      />

      <DashboardCard
        eyebrow="Add entry"
        title="New fill"
        description="Same workspace as the dashboard — R values drive analytics on this device."
        variant="inset"
      >
        {!ready ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <form id="add" onSubmit={onAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jr-time">Time</Label>
              <Input
                id="jr-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:44"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jr-sym">Symbol</Label>
              <Input
                id="jr-sym"
                value={sym}
                onChange={(e) => setSym(e.target.value)}
                placeholder="ES"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jr-r">R</Label>
              <Input
                id="jr-r"
                value={r}
                onChange={(e) => setR(e.target.value)}
                placeholder="+0.5"
                required
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 font-mono text-[15px]"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="jr-setup">Setup</Label>
              <Input
                id="jr-setup"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                placeholder="ORB"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jr-tag">Tag</Label>
              <Input
                id="jr-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Clean"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="jr-note">Note</Label>
              <Input
                id="jr-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional context"
                className="h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px]"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" className="h-10 rounded-xl bg-[oklch(0.72_0.14_250)] text-[15px] text-[oklch(0.12_0.04_265)]">
                Save entry
              </Button>
            </div>
          </form>
        )}
      </DashboardCard>

      <DashboardCard eyebrow="Ingest" title="Normalized fills" description="Your logged trades — newest first.">
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[860px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-bv-surface-inset/80 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                <th scope="col" className="sticky left-0 z-10 bg-bv-surface-inset/95 px-4 py-3 backdrop-blur-sm">
                  Time
                </th>
                <th scope="col" className="px-4 py-3">
                  Symbol
                </th>
                <th scope="col" className="px-4 py-3">
                  Setup
                </th>
                <th scope="col" className="px-4 py-3 text-right tabular-nums">
                  R
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Tag
                </th>
                <th scope="col" className="px-4 py-3">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {data.journal.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    No fills yet — add one above.
                  </td>
                </tr>
              ) : (
                data.journal.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
                    <td className="sticky left-0 z-10 bg-[oklch(0.1_0.025_265/0.97)] px-4 py-3 font-mono text-sm text-zinc-400 backdrop-blur-sm">
                      {row.time}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-100">{row.sym}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                        {row.setup}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-100">{row.r}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{row.tag}</td>
                    <td className="max-w-[240px] px-4 py-3 text-zinc-500">{row.note ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-white/[0.1] bg-bv-surface-inset/30 px-4 py-4">
        <p className="text-[15px] text-zinc-500">Reviews and tagging rules will tie into this stream as features land.</p>
        <Link
          href="/app/reviews"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-[oklch(0.78_0.12_250)] hover:text-[oklch(0.85_0.1_250)]",
          )}
        >
          Open reviews →
        </Link>
      </div>
    </div>
  );
}
