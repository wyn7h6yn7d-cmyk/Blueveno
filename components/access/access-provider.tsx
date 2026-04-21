"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AccessContextClient } from "@/lib/access/types";

const AccessContext = createContext<AccessContextClient | null>(null);

export function AccessProvider({
  value,
  children,
}: {
  value: AccessContextClient;
  children: ReactNode;
}) {
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessContextClient {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    throw new Error("useAccess must be used within AccessProvider.");
  }
  return ctx;
}
