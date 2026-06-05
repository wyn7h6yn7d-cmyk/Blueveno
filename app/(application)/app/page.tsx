import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OverviewDashboardV2 } from "@/components/dashboard/overview-dashboard-v2";
import { getOverviewOnboardingDismissedForUser } from "@/lib/onboarding/load-overview-onboarding-dismissed-server";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [initialWorkspace, initialOnboardingDismissed] = await Promise.all([
    getUserWorkspaceSnapshotForUser(userId),
    getOverviewOnboardingDismissedForUser(userId),
  ]);

  return (
    <OverviewDashboardV2
      userId={userId}
      email={session.user.email ?? ""}
      initialWorkspace={initialWorkspace}
      initialOnboardingDismissed={initialOnboardingDismissed}
      userTimezone={session.user.timezone}
    />
  );
}
