/** Adds https:// when the user pastes a URL without a scheme. */
export function normalizeChartUrlInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function isValidChartUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(normalizeChartUrlInput(value));
    if (!(url.protocol === "https:" || url.protocol === "http:")) return false;
    return url.hostname.trim().length > 0;
  } catch {
    return false;
  }
}

/** Value to persist (normalized) or `undefined` when empty. */
export function chartUrlForSave(raw: string): string | undefined {
  const n = normalizeChartUrlInput(raw);
  return n ? n : undefined;
}
