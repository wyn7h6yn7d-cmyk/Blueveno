import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JournalDetailLoader } from "@/components/journal/journal-detail-loader";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function JournalDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return (
    <JournalDetailLoader userId={session.user.id} entryId={id} initialWorkspace={initialWorkspace} />
  );
}
