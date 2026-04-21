import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <CalendarPageClient userId={session.user.id} initialWorkspace={initialWorkspace} />;
}
