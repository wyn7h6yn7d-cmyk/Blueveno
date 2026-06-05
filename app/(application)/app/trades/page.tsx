import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TradesPageClient } from "@/components/trades/trades-page-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function TradesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return (
    <TradesPageClient
      userId={session.user.id}
      initialWorkspace={initialWorkspace}
      userTimezone={session.user.timezone}
    />
  );
}
