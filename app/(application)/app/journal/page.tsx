import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { JournalWorkspace } from "@/components/journal/journal-workspace";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

type Props = {
  searchParams: Promise<{ date?: string | string[] }>;
};

function parseDateParam(raw: string | string[] | undefined): string | undefined {
  const v = typeof raw === "string" ? raw : undefined;
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
}

export default async function JournalPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const highlightDate = parseDateParam(sp.date);

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return (
    <JournalWorkspace
      userId={session.user.id}
      email={session.user.email ?? ""}
      initialWorkspace={initialWorkspace}
      highlightDate={highlightDate}
    />
  );
}
