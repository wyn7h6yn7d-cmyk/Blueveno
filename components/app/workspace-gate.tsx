"use client";

import type { ReactNode } from "react";
import { TrialUpgradeBanner } from "@/components/app/trial-upgrade-banner";

type Props = {
  children: ReactNode;
};

/** All signed-in users see the workspace; trial/read-only is enforced in DB + UI (no full-app paywall). */
export function WorkspaceGate({ children }: Props) {
  return (
    <>
      <TrialUpgradeBanner />
      {children}
    </>
  );
}
