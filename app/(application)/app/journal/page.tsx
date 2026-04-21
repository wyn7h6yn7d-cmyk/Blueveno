import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ date?: string | string[] }>;
};

/**
 * Legacy list route; journal is the main /app screen.
 */
export default async function JournalListRedirect({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const raw = sp.date;
  const date = typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
  redirect(date ? `/app?date=${encodeURIComponent(date)}` : "/app");
}
