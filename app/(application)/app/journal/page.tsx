import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { JournalPageClient } from "@/components/journal/journal-page-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <JournalPageClient userId={session.user.id} initialWorkspace={initialWorkspace} />;
}
