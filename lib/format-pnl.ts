/** ISO 4217 codes supported for display in journal / stats / calendar */
export const DISPLAY_CURRENCY_CODES = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "AUD",
  "CAD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "JPY",
] as const;

export type DisplayCurrencyCode = (typeof DISPLAY_CURRENCY_CODES)[number];

const VALID = new Set<string>(DISPLAY_CURRENCY_CODES);

export function normalizeDisplayCurrency(raw: string | undefined | null): DisplayCurrencyCode {
  const c = (raw ?? "EUR").toUpperCase().trim();
  if (VALID.has(c)) return c as DisplayCurrencyCode;
  return "EUR";
}

/**
 * Signed currency string for P&L amounts (uses absolute value + explicit sign).
 */
export function formatSignedPnlAmount(n: number, currency: string): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n);
  const cur = normalizeDisplayCurrency(currency);
  const maxFrac = cur === "JPY" ? 0 : 2;
  const fmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  });
  return `${sign}${fmt.format(abs)}`;
}

export function displayCurrencyLabel(code: string): string {
  const c = normalizeDisplayCurrency(code);
  try {
    return new Intl.DisplayNames(undefined, { type: "currency" }).of(c) ?? c;
  } catch {
    return c;
  }
}
