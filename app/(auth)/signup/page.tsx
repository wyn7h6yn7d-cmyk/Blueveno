import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a Blueveno workspace: trading journal and performance analytics for serious operators.",
};

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  return (
    <AuthSplitLayout
      eyebrow="Create account"
      title="Start your workspace"
      subtitle="Turn raw execution into structured review. Start on the free tier and upgrade when you need more."
      alternatePrompt="Already registered?"
      alternateHref="/login"
      alternateLabel="Sign in"
    >
      <p className="mb-6 text-center text-[11px] leading-relaxed text-zinc-600 lg:text-left">
        Prefer to explore first?{" "}
        <Link
          href="/"
          className="font-medium text-[oklch(0.78_0.12_250)] underline-offset-4 hover:underline"
        >
          View the product
        </Link>
      </p>
      <SignupForm />
    </AuthSplitLayout>
  );
}
