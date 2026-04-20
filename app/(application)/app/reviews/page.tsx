import { auth } from "@/auth";
import Link from "next/link";
import { ImageIcon, Inbox } from "lucide-react";
import { hasFeature } from "@/lib/billing/entitlements";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PanelGrid, Panel } from "@/components/app/panel-grid";
import { UpgradePrompt } from "@/components/app/upgrade-prompt";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/app/empty-state";

const shots = [
  { id: "ES · 09:44", fill: "+0.5 R", note: "Liquidity sweep + retest aligned." },
  { id: "NQ · 10:12", fill: "+0.8 R", note: "Fade after failed breakout." },
  { id: "ES · 11:03", fill: "−0.1 R", note: "Scratch — no continuation." },
];

export default async function ReviewsPage() {
  const session = await auth();
  const allowed = hasFeature(session, "reviews.screenshot");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reviews"
        title="Post-trade clarity"
        description="Screenshots bound to fills, session recaps, and exportable packs—evidence, not narrative."
        actions={
          <Link
            href="/app/journal"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            View journal
          </Link>
        }
      />

      {!allowed ? <UpgradePrompt feature="reviews.screenshot" /> : null}

      <PanelGrid>
        <Panel span={7}>
          <DashboardCard
            eyebrow="Screenshot review"
            title="Chart + fill"
            description="Linked records — review cannot drift from what printed."
          >
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
              {shots.map((s) => (
                <figure
                  key={s.id}
                  className="overflow-hidden rounded-xl border border-white/[0.07] bg-bv-surface-inset/80"
                >
                  <div className="relative aspect-[5/4] bg-[oklch(0.07_0.03_265)]">
                    <div className="absolute inset-0 bg-grid-fine opacity-30" aria-hidden />
                    <div className="absolute inset-4 rounded-lg border border-white/[0.08] bg-gradient-to-br from-zinc-800/40 to-zinc-950" />
                    <div className="absolute bottom-4 left-4 right-4 rounded border border-[oklch(0.55_0.15_250/0.35)] bg-black/55 px-2 py-1.5 font-mono text-[9px] text-[oklch(0.85_0.06_250)] backdrop-blur-sm">
                      Entry · {s.id}
                    </div>
                  </div>
                  <figcaption className="space-y-1 border-t border-white/[0.06] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        Linked
                      </span>
                      <span className="font-mono text-xs tabular-nums text-zinc-200">{s.fill}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500">{s.note}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </DashboardCard>
        </Panel>

        <Panel span={5}>
          <DashboardCard
            eyebrow="Session recap"
            title="Summary"
            description="Structured recap you can share with a desk or coach."
          >
            <div className="space-y-4 font-mono text-[12px] leading-relaxed text-zinc-400">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Summary</p>
                <p className="mt-2 text-zinc-300">
                  Two clean sequences; one discretionary add outside playbook. Edge came from patience at the open.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Next session</p>
                <p className="mt-2 text-zinc-300">Enforce max adds when first target is partial.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-500">
              <ImageIcon className="size-4 text-zinc-600" strokeWidth={1.75} />
              Attachments: screenshots sync automatically when this feature is enabled.
            </div>
          </DashboardCard>
        </Panel>
      </PanelGrid>

      <DashboardCard
        eyebrow="Exports"
        title="Review packs"
        description="PDF and shareable links—included when the export pipeline is ready."
        footer={
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Pro · desk seats</p>
        }
      >
        <EmptyState
          icon={Inbox}
          title="No exports queued"
          description="Connect your trade feed to generate recap packs for your desk or coach."
          className="border-none bg-transparent py-10"
        />
      </DashboardCard>
    </div>
  );
}
