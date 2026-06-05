import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReportsPageClient } from "@/components/reports/reports-page-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <ReportsPageClient userId={session.user.id} initialWorkspace={initialWorkspace} />;
}
