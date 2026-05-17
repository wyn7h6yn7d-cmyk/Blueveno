import { PageHeader } from "@/components/app/page-header";

export function AdminServiceUnavailable() {
  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Control"
        title="Admin unavailable"
        description="Admin tools are temporarily unavailable in this environment."
      />
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-[15px] leading-relaxed text-zinc-400 sm:p-6">
        <p className="text-zinc-300">You can continue using Blueveno normally. Please try the admin page again later.</p>
        <p className="mt-4 text-[14px] text-zinc-500">If this persists, contact the workspace owner for access support.</p>
      </div>
    </div>
  );
}
