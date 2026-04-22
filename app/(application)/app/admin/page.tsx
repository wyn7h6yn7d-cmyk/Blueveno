import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { PageHeader } from "@/components/app/page-header";
import { AdminServiceUnavailable } from "@/components/admin/admin-service-unavailable";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { listUsersForAdmin } from "@/app/(application)/app/admin/list-users";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access?.isAdmin) {
    notFound();
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return <AdminServiceUnavailable />;
  }

  const users = await listUsersForAdmin();

  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Admin"
        title="User Control Center"
        description="Manage roles, premium access, trials, and account status in one place."
      />
      <AdminUsersTable users={users} />
    </div>
  );
}
