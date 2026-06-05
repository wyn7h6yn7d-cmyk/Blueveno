export type YDomain = [number, number];

/**
 * Zoomed Y-domain for account balance / capital curves.
 * Never anchors at zero — pads around the visible balance range.
 */
export function computeBalanceYDomain(
  balances: number[],
  startingBalance?: number | null,
): YDomain {
  const finite = balances.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (finite.length === 0) return [0, 1];

  const minBalance = Math.min(...finite);
  const maxBalance = Math.max(...finite);
  const start =
    startingBalance !== null && startingBalance !== undefined && Number.isFinite(startingBalance)
      ? startingBalance
      : 0;
  const range = Math.max(maxBalance - minBalance, start * 0.01, 100);
  const padding = range * 0.15;
  return [minBalance - padding, maxBalance + padding];
}
