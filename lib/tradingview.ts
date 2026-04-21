export function isValidTradingViewUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    if (!(url.protocol === "https:" || url.protocol === "http:")) return false;
    const host = url.hostname.toLowerCase();
    return host === "tradingview.com" || host.endsWith(".tradingview.com");
  } catch {
    return false;
  }
}
