import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { PageHeader } from "@/components/app/page-header";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { listUsersForAdmin } from "@/app/(application)/app/admin/list-users";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access?.isAdmin) {
    notFound();
  }

  const users = await listUsersForAdmin();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Entitlements and access — service role actions; changes apply immediately."
      />
      <AdminUsersTable users={users} />
    </div>
  );
}
