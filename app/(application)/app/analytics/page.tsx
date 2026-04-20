import { auth } from "@/auth";
import { hasFeature } from "@/lib/billing/entitlements";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { UpgradePrompt } from "@/components/app/upgrade-prompt";

export default async function AnalyticsPage() {
  const session = await auth();
  const allowed = hasFeature(session, "analytics.advanced");

  return (
    <div className="space-y-6">
      <PlaceholderPage
        title="Analytics"
        description="Distributions, streaks, and regime analysis — chart primitives plug in here."
      />
      {!allowed ? <UpgradePrompt feature="analytics.advanced" /> : null}
    </div>
  );
}
