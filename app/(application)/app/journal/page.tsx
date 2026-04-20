import { auth } from "@/auth";
import { hasFeature } from "@/lib/billing/entitlements";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { UpgradePrompt } from "@/components/app/upgrade-prompt";

export default async function JournalPage() {
  const session = await auth();
  const allowed = hasFeature(session, "journal.create");

  return (
    <div className="space-y-6">
      <PlaceholderPage
        title="Journal"
        description="Automatic trade stream, tags, and screenshots — persistence comes with Prisma."
      />
      {!allowed ? <UpgradePrompt feature="journal.create" /> : null}
    </div>
  );
}
