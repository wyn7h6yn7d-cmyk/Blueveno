import Link from "next/link";
import { auth } from "@/auth";
import { PageHeader } from "@/components/app/page-header";
import { SignOutButton } from "@/components/account/sign-out-button";

export default async function AccountDisabledPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
      <PageHeader
        eyebrow="Account"
        title="Access paused"
        description="This workspace has been disabled. If you believe this is a mistake, contact support."
      />
      <div className="mt-8 space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        {session?.user?.email ? (
          <p className="text-[14px] text-zinc-400">
            Signed in as <span className="text-zinc-200">{session.user.email}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <Link href="/" className="text-[13px] text-[oklch(0.78_0.1_250)] underline-offset-4 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
