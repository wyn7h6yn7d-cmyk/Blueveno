import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JournalEntryEditLoader } from "@/components/journal/journal-entry-edit-loader";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

/**
 * Entry row is loaded in {@link JournalEntryEditLoader} with the browser client so
 * RLS + JWT match the journal list (server fetch could return empty on some hosts).
 */
export default async function JournalEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return (
    <JournalEntryEditLoader
      userId={session.user.id}
      entryId={id}
      initialWorkspace={initialWorkspace}
    />
  );
}
