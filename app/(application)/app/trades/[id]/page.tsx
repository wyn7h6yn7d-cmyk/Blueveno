import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TradeDetailLoader } from "@/components/trades/trade-detail-loader";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function TradeDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return <TradeDetailLoader userId={session.user.id} entryId={id} initialWorkspace={initialWorkspace} />;
}
