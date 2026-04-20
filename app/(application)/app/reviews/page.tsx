import { auth } from "@/auth";
import { hasFeature } from "@/lib/billing/entitlements";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { UpgradePrompt } from "@/components/app/upgrade-prompt";

export default async function ReviewsPage() {
  const session = await auth();
  const allowed = hasFeature(session, "reviews.premium");

  return (
    <div className="space-y-6">
      <PlaceholderPage
        title="Reviews"
        description="Session recaps, screenshot review, and structured post-trade analysis."
      />
      {!allowed ? <UpgradePrompt feature="reviews.premium" /> : null}
    </div>
  );
}
