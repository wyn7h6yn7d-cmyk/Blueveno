import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolvePostAuthLanding } from "@/lib/auth/post-auth-landing.server";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a Blueveno workspace—structured journaling, analytics, and review for operators who treat performance as a system.",
};

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    const landing = await resolvePostAuthLanding(session);
    if (landing === "account_disabled") redirect("/account-disabled");
    if (landing === "app") redirect("/app");
    /* profile_error — same recovery path as login */
    redirect("/login");
  }

  return (
    <AuthSplitLayout
      variant="signup"
      eyebrow="Create account"
      title={
        <>
          Open your <span className="text-gradient-cobalt">workspace</span>
        </>
      }
      subtitle="Turn raw execution into proof. Start on the free tier and scale when your process—not hype—demands it."
      alternatePrompt="Already registered?"
      alternateHref="/login"
      alternateLabel="Sign in"
    >
      <p className="mb-8 text-center text-[12px] leading-relaxed text-zinc-600 lg:mb-9 lg:text-left">
        Prefer to explore first?{" "}
        <Link
          href="/"
          className="font-medium text-bv-ice/85 underline-offset-[6px] transition hover:text-primary hover:underline"
        >
          View the product
        </Link>
      </p>
      <SignupForm />
    </AuthSplitLayout>
  );
}
