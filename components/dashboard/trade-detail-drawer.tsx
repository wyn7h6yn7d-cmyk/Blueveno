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
        className="w-full max-w-md border-white/[0.08] bg-[oklch(0.1_0.03_265)] p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-white/[0.06] px-5 py-4 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Trade</p>
          <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
            {t.symbol} · {t.side}
          </SheetTitle>
          <p className="font-mono text-xs text-zinc-500">{t.id}</p>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Opened</dt>
              <dd className="mt-1 font-mono text-xs text-zinc-300">{t.openedAt}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Closed</dt>
              <dd className="mt-1 font-mono text-xs text-zinc-300">{t.closedAt}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Setup</dt>
              <dd className="mt-1 text-zinc-200">{t.setup}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Entry</dt>
              <dd className="mt-1 font-mono tabular-nums text-zinc-100">{t.entry}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Exit</dt>
              <dd className="mt-1 font-mono tabular-nums text-zinc-100">{t.exit}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Size</dt>
              <dd className="mt-1 font-mono tabular-nums text-zinc-300">{t.size}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">R</dt>
              <dd className="mt-1 font-mono tabular-nums text-[oklch(0.82_0.1_250)]">{t.rMultiple}</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">P&amp;L</span>
              <span className="font-display text-xl tabular-nums text-zinc-50">{t.netPnl}</span>
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs text-zinc-500">
              <span>Gross {t.grossPnl}</span>
              <span>Fees {t.fees}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/[0.06] bg-bv-surface-inset/60 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">MAE</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-amber-200/90">{t.mae}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-bv-surface-inset/60 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">MFE</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-[oklch(0.78_0.12_250)]">{t.mfe}</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Tags</p>
            <SetupTags tags={t.tags} className="mt-2" />
          </div>

          {t.notes ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Desk note</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t.notes}</p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
