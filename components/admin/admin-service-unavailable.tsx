import { PageHeader } from "@/components/app/page-header";

export function AdminServiceUnavailable() {
  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Control"
        title="Admin unavailable"
        description="The admin console needs a Supabase service role key on the server."
      />
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-[15px] leading-relaxed text-zinc-400">
        <p className="text-zinc-300">
          Add{" "}
          <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-emerald-200/90">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          to Vercel → Project → Settings → Environment Variables (Production), then redeploy.
        </p>
        <p className="mt-4 text-[14px] text-zinc-500">
          Supabase Dashboard → Project Settings → API → <span className="text-zinc-400">service_role</span> (secret).
          Never expose this key to the client or <code className="font-mono text-[12px]">NEXT_PUBLIC_*</code>.
        </p>
      </div>
    </div>
  );
}
