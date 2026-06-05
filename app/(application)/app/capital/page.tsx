import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CapitalPageClient } from "@/components/capital/capital-page-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function CapitalPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <CapitalPageClient userId={session.user.id} initialWorkspace={initialWorkspace} />;
}
