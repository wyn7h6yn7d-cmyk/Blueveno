/** Adds https:// when the user pastes `www.tradingview.com/...` without a scheme. */
export function normalizeTradingViewUrlInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function isValidTradingViewUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(normalizeTradingViewUrlInput(value));
    if (!(url.protocol === "https:" || url.protocol === "http:")) return false;
    const host = url.hostname.toLowerCase();
    return host === "tradingview.com" || host.endsWith(".tradingview.com");
  } catch {
    return false;
  }
}

/** Value to persist (normalized) or `undefined` when empty. */
export function tradingViewUrlForSave(raw: string): string | undefined {
  const n = normalizeTradingViewUrlInput(raw);
  return n ? n : undefined;
}
