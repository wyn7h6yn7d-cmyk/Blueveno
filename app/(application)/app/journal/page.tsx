import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { JournalPageClient } from "@/components/journal/journal-page-client";

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <JournalPageClient userId={session.user.id} />;
}
