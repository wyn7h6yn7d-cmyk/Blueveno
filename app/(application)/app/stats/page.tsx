import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StatsPageClient } from "@/components/stats/stats-page-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <StatsPageClient userId={session.user.id} initialWorkspace={initialWorkspace} />;
}
