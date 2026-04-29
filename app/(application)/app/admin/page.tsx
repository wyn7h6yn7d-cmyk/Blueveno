import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { PageHeader } from "@/components/app/page-header";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminServiceUnavailable } from "@/components/admin/admin-service-unavailable";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { listUsersForAdmin } from "@/app/(application)/app/admin/list-users";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { ADMIN_FULL_ACCESS_EMAIL } from "@/lib/billing/workspace-access";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <AdminAccessDenied />;
  }
  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access?.isAdmin) {
    return <AdminAccessDenied />;
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
        title="User management"
        description={`Manage roles, access, and account status. ${ADMIN_FULL_ACCESS_EMAIL} is permanently protected as full admin.`}
      />
      <AdminUsersTable users={users} />
    </div>
  );
}
