import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StatsPageV2 } from "@/components/stats/stats-page-v2";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <StatsPageV2 userId={session.user.id} initialWorkspace={initialWorkspace} />;
}
