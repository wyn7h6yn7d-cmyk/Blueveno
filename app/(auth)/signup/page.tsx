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
    "Create a Blueveno workspace. Start your 7-day free trial with 1 trading account and keep your history visible after trial.",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    url: "/signup",
    title: "Create account — Blueveno",
    description:
      "Create a Blueveno workspace. Start your 7-day free trial with 1 trading account and keep your history visible after trial.",
  },
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
      subtitle="Start your 7-day free trial with 1 trading account. Read-only access after trial until upgrade."
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
