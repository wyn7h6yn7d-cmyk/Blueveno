import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Analytics lives at /app/stats in v2 — keep legacy URL working. */
export default async function AnalyticsPage() {
  await auth();
  redirect("/app/stats");
}
