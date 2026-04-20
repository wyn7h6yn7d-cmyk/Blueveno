"use client";

import type { ReactNode } from "react";

type GatedClientProps = {
  /** Result of a server-side hasFeature check passed as prop */
  allowed: boolean;
  children: ReactNode;
  fallback: ReactNode;
};

/**
 * Client boundary — use when the parent Server Component already computed `allowed`.
 */
export function GatedClient({ allowed, children, fallback }: GatedClientProps) {
  if (!allowed) {
    return fallback;
  }
  return children;
}
