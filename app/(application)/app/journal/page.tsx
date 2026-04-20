import { auth } from "@/auth";
import Link from "next/link";
import { Download, Filter } from "lucide-react";
import { hasFeature } from "@/lib/billing/entitlements";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { UpgradePrompt } from "@/components/app/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const rows = [
  {
    time: "09:44:02",
    symbol: "ES",
    side: "Long",
    setup: "ORB",
    size: "2",
    r: "+0.50",
    slip: "0.25t",
    note: "Entry on retest",
  },
  {
    time: "10:12:18",
    symbol: "NQ",
    side: "Short",
    setup: "Fade",
    size: "1",
    r: "+0.80",
    slip: "—",
    note: "News off",
  },
  {
    time: "11:03:41",
    symbol: "ES",
    side: "Flat",
    setup: "Scratch",
    size: "2",
    r: "−0.10",
    slip: "1.0t",
    note: "No follow-through",
  },
  {
    time: "13:22:09",
    symbol: "CL",
    side: "Long",
    setup: "VWAP",
    size: "1",
    r: "+0.35",
    slip: "0.5t",
    note: "Partial at +1R",
  },
];

export default async function JournalPage() {
  const session = await auth();
  const allowed = hasFeature(session, "journal.unlimited");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Journal"
        title="Trade stream"
        description="Automatic ingest, tags, and screenshots tied to fills: your execution record, not a reconstructed story."
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
              disabled
            >
              <Download className="size-4" strokeWidth={1.75} />
              Export
            </Button>
          </>
        }
      />

      {!allowed ? <UpgradePrompt feature="journal.unlimited" /> : null}

      <DashboardCard
        eyebrow="Ingest"
        title="Normalized fills"
        description="Sample data—connect your broker or prop API to see live fills."
      >
        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-bv-surface-inset/80 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                <th scope="col" className="sticky left-0 z-10 bg-bv-surface-inset/95 px-4 py-3 backdrop-blur-sm">
                  Time
                </th>
                <th scope="col" className="px-4 py-3">
                  Symbol
                </th>
                <th scope="col" className="px-4 py-3">
                  Side
                </th>
                <th scope="col" className="px-4 py-3">
                  Setup
                </th>
                <th scope="col" className="px-4 py-3 text-right tabular-nums">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 text-right tabular-nums">
                  R
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Slip
                </th>
                <th scope="col" className="px-4 py-3">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.time} className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
                  <td className="sticky left-0 z-10 bg-[oklch(0.1_0.025_265/0.97)] px-4 py-3 font-mono text-xs text-zinc-400 backdrop-blur-sm">
                    {row.time}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{row.symbol}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.side}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                      {row.setup}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">{row.size}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-100">{row.r}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-zinc-500">{row.slip}</td>
                  <td className="max-w-[220px] px-4 py-3 text-zinc-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-white/[0.1] bg-bv-surface-inset/30 px-4 py-4">
        <p className="text-sm text-zinc-500">
          Tagging rules and screenshot capture are planned for a future release.
        </p>
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
