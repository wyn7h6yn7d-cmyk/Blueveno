/**
 * Same-origin relative path only — blocks protocol-relative and other open-redirect
 * patterns for `next` query params after OAuth / email confirmation.
 */
export function safeAppRedirectPath(next: string | null): string {
  const fallback = "/app";
  if (next == null || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("\\") || t.includes("\0")) return fallback;
  return t;
}
