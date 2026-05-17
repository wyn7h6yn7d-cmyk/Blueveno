"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { TradeDetail } from "@/components/dashboard/types";
import { SetupTags } from "@/components/dashboard/setup-tags";

const defaultTrade: TradeDetail = {
  id: "es-20240418-0944",
  symbol: "ES Jun",
  side: "Long",
  openedAt: "09:44:01.182",
  closedAt: "09:52:44.009",
  setup: "ORB · retest",
  entry: "5246.25",
  exit: "5248.50",
  size: "2",
  grossPnl: "+$900",
  fees: "−$8.40",
  netPnl: "+$891.60",
  rMultiple: "+0.50",
  mae: "−0.12 R",
  mfe: "+0.62 R",
  tags: ["ORB", "Open drive", "Liquidity"],
  notes: "First pullback held; scaled 1 lot at +1R.",
};

type TradeDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade?: TradeDetail | null;
};

export function TradeDetailDrawer({
  open,
  onOpenChange,
  trade = defaultTrade,
}: TradeDetailDrawerProps) {
  const t = trade ?? defaultTrade;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full max-w-md border-border/85 bg-bv-surface p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-white/[0.06] px-5 py-4 text-left">
          <p className="app-metric-label">Trade</p>
          <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
            {t.symbol} · {t.side}
          </SheetTitle>
          <p className="font-mono text-xs text-zinc-500">{t.id}</p>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="app-kicker">Opened</dt>
              <dd className="mt-1 font-mono text-xs text-zinc-300">{t.openedAt}</dd>
            </div>
            <div>
              <dt className="app-kicker">Closed</dt>
              <dd className="mt-1 font-mono text-xs text-zinc-300">{t.closedAt}</dd>
            </div>
            <div className="col-span-2">
              <dt className="app-kicker">Setup</dt>
              <dd className="mt-1 text-zinc-200">{t.setup}</dd>
            </div>
            <div>
              <dt className="app-kicker">Entry</dt>
              <dd className="mt-1 font-mono tabular-nums text-zinc-100">{t.entry}</dd>
            </div>
            <div>
              <dt className="app-kicker">Exit</dt>
              <dd className="mt-1 font-mono tabular-nums text-zinc-100">{t.exit}</dd>
            </div>
            <div>
              <dt className="app-kicker">Size</dt>
              <dd className="mt-1 font-mono tabular-nums text-zinc-300">{t.size}</dd>
            </div>
            <div>
              <dt className="app-kicker">R</dt>
              <dd className="mt-1 font-mono tabular-nums text-bv-ice/95">{t.rMultiple}</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="app-kicker">P&amp;L</span>
              <span className="font-display text-xl tabular-nums text-zinc-50">{t.netPnl}</span>
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs text-zinc-500">
              <span>Gross {t.grossPnl}</span>
              <span>Fees {t.fees}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/[0.06] bg-bv-surface-inset/60 px-3 py-2">
              <p className="app-kicker">MAE</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-amber-200/90">{t.mae}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-bv-surface-inset/60 px-3 py-2">
              <p className="app-kicker">MFE</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-primary/90">{t.mfe}</p>
            </div>
          </div>

          <div>
            <p className="app-kicker">Tags</p>
            <SetupTags tags={t.tags} className="mt-2" />
          </div>

          {t.notes ? (
            <div>
              <p className="app-kicker">Desk note</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t.notes}</p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
