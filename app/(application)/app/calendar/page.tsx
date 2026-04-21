import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <CalendarPageClient userId={session.user.id} />;
}
