import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { JournalEntryEditClient } from "@/components/journal/journal-entry-edit-client";
import { getUserWorkspaceSnapshotForUser } from "@/lib/user-data/get-user-workspace-server";
import type { JournalRow } from "@/lib/user-data/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JournalEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("journal_entries")
    .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const initialRow: JournalRow = {
    id: row.id as string,
    createdAt: (row.created_at as string | null) ?? undefined,
    entryDate: (row.entry_date as string | null) ?? undefined,
    time: (row.entry_time as string) ?? "",
    sym: (row.symbol as string) ?? "",
    setup: (row.setup as string) ?? "—",
    r: (row.r_value as string) ?? "",
    tag: (row.tag as string) ?? "Manual",
    note: (row.note as string | null) ?? undefined,
    tradingViewUrl: (row.tradingview_url as string | null) ?? undefined,
  };

  const initialWorkspace = await getUserWorkspaceSnapshotForUser(session.user.id);

  return (
    <JournalEntryEditClient
      userId={session.user.id}
      entryId={id}
      initialWorkspace={initialWorkspace}
      initialRow={initialRow}
    />
  );
}
