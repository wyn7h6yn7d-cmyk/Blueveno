"use client";

import { formatSignedPnlAmount, normalizeDisplayCurrency } from "@/lib/format-pnl";
import type { LineAreaPoint } from "@/components/v2/charts/line-area-chart";

type BalanceTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: LineAreaPoint }>;
  label?: string | number;
  currency?: string;
};

function formatBalanceAmount(value: number, currency: string): string {
  const cur = normalizeDisplayCurrency(currency);
  const maxFrac = cur === "JPY" ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  }).format(value);
}

export function BalanceCurveTooltip({ active, payload, label, currency = "USD" }: BalanceTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as LineAreaPoint | undefined;
  if (!point) return null;

  const balance = typeof point.balance === "number" ? point.balance : Number(point.pnl);
  const dailyPnl = typeof point.dailyPnl === "number" ? point.dailyPnl : null;
  const cumulativePnl = typeof point.cumulativePnl === "number" ? point.cumulativePnl : null;

  if (!Number.isFinite(balance)) return null;

  const dateLabel = typeof point.day === "string" && point.day.trim() ? point.day : String(label ?? "—");

  return (
    <div
      className="rounded-lg border border-white/10 px-3 py-2 text-[12px] shadow-lg"
      style={{ background: "oklch(0.16 0.03 260 / 0.96)", color: "oklch(0.92 0.01 260)" }}
    >
      <p className="mb-1.5 text-[11px] text-zinc-400">{dateLabel}</p>
      <dl className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-zinc-500">Balance</dt>
          <dd className="font-mono tabular-nums text-zinc-100">{formatBalanceAmount(balance, currency)}</dd>
        </div>
        {dailyPnl !== null && Number.isFinite(dailyPnl) ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-zinc-500">Daily P&amp;L</dt>
            <dd className="font-mono tabular-nums text-zinc-200">{formatSignedPnlAmount(dailyPnl, currency)}</dd>
          </div>
        ) : null}
        {cumulativePnl !== null && Number.isFinite(cumulativePnl) ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-zinc-500">Cumulative P&amp;L</dt>
            <dd className="font-mono tabular-nums text-zinc-200">{formatSignedPnlAmount(cumulativePnl, currency)}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
