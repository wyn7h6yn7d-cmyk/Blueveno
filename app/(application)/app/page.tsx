import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return (
    <OverviewDashboard
      userId={session.user.id}
      email={session.user.email ?? ""}
      initialWorkspace={initialWorkspace}
      userTimezone={session.user.timezone}
    />
  );
}
