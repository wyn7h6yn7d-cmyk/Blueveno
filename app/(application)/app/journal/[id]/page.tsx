import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JournalDetailLoader } from "@/components/journal/journal-detail-loader";

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

  return <JournalDetailLoader userId={session.user.id} entryId={id} />;
}
