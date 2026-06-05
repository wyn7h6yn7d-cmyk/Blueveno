import { PageHeader } from "@/components/v2/layout";
import { SectionCard } from "@/components/v2/cards";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";

export function AdminServiceUnavailable() {
  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Control"
        title="Admin unavailable"
        description="Admin tools are temporarily unavailable in this environment."
      />
      <SectionCard contentClassName="p-0 sm:p-0">
        <EmptyStatePanel
          title="Service role not configured"
          description="You can continue using Blueveno normally. Please try the admin page again later. If this persists, contact the workspace owner."
        />
      </SectionCard>
    </div>
  );
}
