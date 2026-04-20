import { auth } from "@/auth";
import { hasFeature } from "@/lib/billing/entitlements";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PanelGrid, Panel } from "@/components/app/panel-grid";
import { UpgradePrompt } from "@/components/app/upgrade-prompt";
import { Button } from "@/components/ui/button";

const tags = ["ORB", "Fade", "VWAP", "News-off", "Opening drive", "Gap fill"];

const playbooks = [
  {
    name: "ES · opening drive",
    adherence: "86%",
    conditions: [
      { ok: true, text: "Opening range defined · first 15m" },
      { ok: true, text: "Drive holds above prior day mid" },
      { ok: false, text: "Macro event inside 30m window" },
    ],
    enforce: "If red → no add. Scale only on partial +1R.",
  },
  {
    name: "NQ · fade failed breakout",
    adherence: "72%",
    conditions: [
      { ok: true, text: "Liquidity sweep visible on 1m" },
      { ok: true, text: "Rejection wick vs reference level" },
      { ok: true, text: "Volatility within band" },
    ],
    enforce: "Max 2 attempts · scratch after second fade.",
  },
];

export default async function PlaybooksPage() {
  const session = await auth();
  const allowed = hasFeature(session, "playbooks.full");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Playbooks"
        title="Rules beside execution"
        description="If-then conditions and adherence measured against your journal—plans stay visible while markets move."
        actions={
          <Button
            type="button"
            className="h-9 rounded-xl bg-[oklch(0.72_0.14_250)] px-4 text-[oklch(0.12_0.04_265)] hover:bg-[oklch(0.78_0.12_250)]"
            disabled={!allowed}
          >
            New playbook
          </Button>
        }
      />

      {!allowed ? <UpgradePrompt feature="playbooks.full" /> : null}

      <DashboardCard eyebrow="Strategy tags" title="Taxonomy" description="Used across journal, analytics, and review.">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      </DashboardCard>

      <PanelGrid>
        {playbooks.map((pb) => (
          <Panel key={pb.name} span={6}>
            <DashboardCard
              eyebrow="Playbook"
              title={pb.name}
              footer={
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    Adherence · {pb.adherence}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-white/[0.1] bg-transparent text-xs text-zinc-300"
                    disabled={!allowed}
                  >
                    Edit
                  </Button>
                </div>
              }
            >
              <ul className="space-y-2">
                {pb.conditions.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300"
                  >
                    <span className={c.ok ? "text-emerald-400/90" : "text-zinc-600"}>{c.ok ? "✓" : "○"}</span>
                    {c.text}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg border border-dashed border-white/[0.1] bg-bv-surface-inset/60 p-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                {pb.enforce}
              </div>
            </DashboardCard>
          </Panel>
        ))}
      </PanelGrid>
    </div>
  );
}
