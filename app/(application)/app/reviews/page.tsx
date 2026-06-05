import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Dedicated reviews route is not in v2 launch — weekly review lives in Journal. */
export default async function ReviewsPage() {
  await auth();
  redirect("/app/journal?tab=add");
}
