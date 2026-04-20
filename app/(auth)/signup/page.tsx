import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Blueveno account.",
};

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="font-display text-2xl font-medium tracking-tight text-foreground">Blueveno</p>
        <h1 className="mt-3 text-lg text-muted-foreground">Create your workspace</h1>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
