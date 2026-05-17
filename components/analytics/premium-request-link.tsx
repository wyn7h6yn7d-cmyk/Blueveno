"use client";

import type { ReactNode } from "react";
import { PREMIUM_REQUEST_MAILTO } from "@/lib/access/access-messaging";
import { trackPremiumRequestClicked } from "@/lib/analytics/track-product-event";

type PremiumRequestLinkProps = {
  source: string;
  className?: string;
  children: ReactNode;
};

export function PremiumRequestLink({ source, className, children }: PremiumRequestLinkProps) {
  return (
    <a
      href={PREMIUM_REQUEST_MAILTO}
      className={className}
      onClick={() => trackPremiumRequestClicked(source)}
    >
      {children}
    </a>
  );
}
