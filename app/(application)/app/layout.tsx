import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/app-shell";
import { loadAccessForUser } from "@/lib/access/load-access";
import { toClientAccess } from "@/lib/access/resolve-access";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access) {
    redirect("/login");
  }
  if (access.profile.account_disabled) {
    redirect("/account-disabled");
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        timezone: session.user.timezone,
      }}
      access={toClientAccess(access, session.user.displayCurrency)}
    >
      {children}
    </AppShell>
  );
}
