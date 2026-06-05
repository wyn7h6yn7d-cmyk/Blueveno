import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Playbooks are not in v2 launch — send users to Journal. */
export default async function PlaybooksPage() {
  await auth();
  redirect("/app/journal");
}
