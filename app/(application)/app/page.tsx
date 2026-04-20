import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <UserDashboard userId={session.user.id} email={session.user.email ?? ""} />;
}
