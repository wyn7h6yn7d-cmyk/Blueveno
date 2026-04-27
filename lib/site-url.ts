/**
 * Canonical absolute URL for SEO metadata, Open Graph, and structured data.
 *
 * Behavior:
 * - **`NEXT_PUBLIC_SITE_URL`** — explicit override (staging, tunnels, tests).
 * - **Vercel production** (`VERCEL_ENV=production`) — `https://www.blueveno.com`.
 * - **Vercel preview / branch** — `https://${VERCEL_URL}` (never hardcode *.vercel.app).
 * - **Local dev** — `http://localhost:3000` when no Vercel URL is set.
 */
export const PRODUCTION_SITE_URL = "https://www.blueveno.com";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Absolute URL for a path (leading slash). */
export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
